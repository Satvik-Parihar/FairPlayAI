import pickle
import joblib
import traceback


# fairness/models.py
from django.db import models
from pymongo import MongoClient
import gridfs
from bson import ObjectId
from datetime import datetime
import pandas as pd
import io

class AnalysisReportRecord(models.Model):
    user_id = models.CharField(max_length=100)
    mongo_id = models.CharField(max_length=100)  # Links to MongoDB report _id
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='processing') # Add more states: 'uploaded', 'cleaning_pending', 'cleaned', 'analyzing', 'completed', 'failed'

    def __str__(self):
        return f"Report by {self.user_id} | MongoID: {self.mongo_id}"

# --- MongoDB logic (not a Django model) ---
class AnalysisReport:
    @classmethod
    def load_model_from_gridfs(cls, file_id):
        """
        Load a model.pkl file from GridFS and return the unpickled model object.
        Handles both pickle and joblib formats.
        """
        try:
            file_bytes = cls.get_file_from_gridfs(file_id)
            try:
                # Try pickle first
                model = pickle.loads(file_bytes)
            except Exception:
                # Try joblib
                import io
                model = joblib.load(io.BytesIO(file_bytes))
            return model
        except Exception as e:
            raise RuntimeError(f"Failed to load model from GridFS: {e}")

    @staticmethod
    def check_model_compatibility(model, X):
        """
        Check if the model can accept the features in X.
        Returns (True, None) if compatible, else (False, error_message)
        """
        # Check for sklearn-like API
        if not hasattr(model, 'predict'):
            return False, "Uploaded model does not have a 'predict' method."
        # Check input features
        try:
            # Try a dry run with a small sample
            _ = model.predict(X.iloc[:1])
        except Exception as e:
            return False, f"Model prediction failed: {e}"
        return True, None

    @staticmethod
    def get_model_type(model):
        """
        Try to auto-detect if model is classifier or regressor.
        Returns 'classification', 'regression', or None.
        """
        # sklearn API
        if hasattr(model, "predict_proba"):
            return "classification"
        # Try to infer from class name
        name = model.__class__.__name__.lower()
        if "regress" in name:
            return "regression"
        if "classif" in name or "classifier" in name:
            return "classification"
        # Fallback: None
        return None

    @classmethod
    def run_uploaded_model_fairness(cls, model_file_id, df, target_col, sensitive_attrs):
        """
        Main entry: Given a model.pkl in GridFS, a DataFrame, target column, and sensitive attributes,
        - Loads the model
        - Checks compatibility
        - Predicts
        - Runs fairness metrics
        Returns: dict with keys: success, error, y_pred, y_true, model_type, metrics, model_summary
        """
        try:
            model = cls.load_model_from_gridfs(model_file_id)
            # Extract required features from model if possible
            required_features = None
            if hasattr(model, "feature_names_in_"):
                required_features = list(model.feature_names_in_)
            elif hasattr(model, "n_features_in_"):
                required_features = None  # Only number, not names
            else:
                required_features = None
        except Exception as e:
            return {"success": False, "error": f"Failed to load model: {e}"}

        # Check target column
        if target_col not in df.columns:
            return {"success": False, "error": f"Target column '{target_col}' not found in dataset."}

        X = df.drop(columns=[target_col])
        y_true = df[target_col]

        # Check compatibility
        compatible, err = cls.check_model_compatibility(model, X)
        if not compatible:
            return {"success": False, "error": f"Model incompatible: {err}"}

        # Predict
        try:
            y_pred = model.predict(X)
        except Exception as e:
            return {"success": False, "error": f"Model prediction failed: {e}"}

        # Detect model type
        model_type = cls.get_model_type(model)
        if model_type is None:
            return {"success": False, "error": "Could not auto-detect model type (classification/regression)."}

        # Run fairness metrics (assume you have a function run_fairness_metrics)
        try:
            # Try to import run_fairness_metrics from fairness_metrics.py if it exists, else define a basic version here
            try:
                from datasets.fairness_metrics import run_fairness_metrics
            except ImportError:
                # Minimal fallback implementation
                def run_fairness_metrics(y_true, y_pred, df, sensitive_attrs, model_type):
                    # This is a placeholder. Replace with actual fairness metrics logic as needed.
                    return {
                        "accuracy": (y_true == y_pred).mean() if hasattr(y_true, "__eq__") else None,
                        "sensitive_attrs_checked": sensitive_attrs,
                        "model_type": model_type
                    }
            metrics = run_fairness_metrics(y_true, y_pred, df, sensitive_attrs, model_type)
        except Exception as e:
            return {"success": False, "error": f"Fairness metric computation failed: {e}"}

        # Model summary (basic)
        model_summary = str(model)

        return {
            "success": True,
            "y_pred": y_pred.tolist() if hasattr(y_pred, 'tolist') else list(y_pred),
            "y_true": y_true.tolist() if hasattr(y_true, 'tolist') else list(y_true),
            "model_type": model_type,
            "metrics": metrics,
            "model_summary": model_summary,
            "required_features": required_features
        }
    # client = MongoClient('mongodb://localhost:27017/')
    # db = client['fairness_audit']
    client = MongoClient('mongodb://kasak:Project%40123@127.0.0.1:27017/FairPlayAI?authSource=admin') # Use your configured URI
    db = client['FairPlayAI']

    fs = gridfs.GridFS(db)

    @classmethod
    def create_report(cls, user_id, data, files=None):
        def stringify_keys(obj):
            if isinstance(obj, dict):
                return {str(k): stringify_keys(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [stringify_keys(v) for v in obj]
            else:
                return obj

        safe_data = stringify_keys(data)
        result = cls.db.reports.insert_one({
            **safe_data,
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "status": "uploaded", # Initial status after upload
            "cleaning_info": {} # To store cleaning options and stats
        })
        return str(result.inserted_id)

    @classmethod
    def get_report(cls, report_id):
        return cls.db.reports.find_one({"_id": ObjectId(report_id)})

    @classmethod
    def update_report(cls, report_id, update_data):
        cls.db.reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": update_data}
        )

    @classmethod
    def upload_file_to_gridfs(cls, file_content, filename, report_id):
        file_id = cls.fs.put(file_content, filename=filename, report_id=ObjectId(report_id))
        return str(file_id)

    @classmethod
    def get_file_from_gridfs(cls, file_id):
        return cls.fs.get(ObjectId(file_id)).read()

    @classmethod
    def delete_file_from_gridfs(cls, file_id):
        cls.fs.delete(ObjectId(file_id))