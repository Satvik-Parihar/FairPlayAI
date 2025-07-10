# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from .models import AnalysisResult
# from .serializers import AnalysisResultSerializer
# import pandas as pd
# import uuid
# import os

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def upload_dataset(request):
#     csv_file = request.FILES.get('csv_file')
#     model_file = request.FILES.get('model_file')
#     sensitive_attributes = request.POST.get('sensitive_attributes', '[]')

#     df = pd.read_csv(csv_file)
#     # TODO: Plug in your ML logic here
#     analysis_id = str(uuid.uuid4())
    
#     dummy_metrics = {
#         "gender_bias": 0.78,
#         "age_bias": 0.61,
#         "caste_bias": 0.84
#     }

#     suggestions = [
#         "Consider removing gender feature for neutrality.",
#         "Use re-sampling to rebalance age groups."
#     ]

#     result = AnalysisResult.objects.create(
#         analysis_id=analysis_id,
#         username=request.user.username,
#         sensitive_attributes=sensitive_attributes,
#         metrics=dummy_metrics,
#         suggestions=suggestions,
#         graph_urls=["/media/graph1.png"]
#     )
    
#     return Response({"analysis_id": result.analysis_id}, status=201)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_analysis(request, analysis_id):
#     try:
#         result = AnalysisResult.objects.get(analysis_id=analysis_id)
#         serializer = AnalysisResultSerializer(result)
#         return Response(serializer.data)
#     except AnalysisResult.DoesNotExist:
#         return Response({"error": "Analysis not found"}, status=404)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def analysis_history(request):
#     results = AnalysisResult.objects.filter(username=request.user.username).order_by('-created_at')
#     serializer = AnalysisResultSerializer(results, many=True)
#     return Response(serializer.data)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import AnalysisReport
from .serializers import ReportSerializer
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, recall_score, f1_score
from sklearn.calibration import calibration_curve
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.neighbors import KNeighborsClassifier
from aif360.metrics import BinaryLabelDatasetMetric
from aif360.datasets import BinaryLabelDataset
import json
import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from django.core.files.base import ContentFile
import matplotlib.pyplot as plt
import io
import base64
from .utils import generate_bias_plot, generate_mitigation_suggestions
from .clean_data import clean_and_preprocess_data as preprocess_data


def generate_fairness_plot(results):
    fig, ax = plt.subplots()
    model_names = [r['model_name'] for r in results]
    fairness_scores = [r['fairness_metrics']['overall_score'] for r in results]

    ax.bar(model_names, fairness_scores, color='skyblue')
    ax.set_title('Fairness Score by Model')
    ax.set_ylabel('Score')
    ax.set_ylim(0, 10)

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close(fig)

    buf.seek(0)
    image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return image_base64

@api_view(['POST'])
def upload_and_analyze(request):
    try:
        # Get data from request
        csv_file = request.FILES.get('csv_file')
        model_file = request.FILES.get('model_file')
        sensitive_attributes = json.loads(request.data.get('sensitive_attributes', '[]'))
        
        # Read dataset
        df = pd.read_csv(csv_file)
        
        # Preprocess data
        # processed_df = preprocess_data(df, sensitive_attributes)
        
        # # Split data
        # X = processed_df.drop(columns=['target'])
        # y = processed_df['target']
        target_column = request.data.get('target_column')
        # processed_df = preprocess_data(df, sensitive_attributes, target_column)
        if not target_column:
            return Response({"error": "Target column is required."}, status=400)

        processed_df = preprocess_data(df, sensitive_attributes, target_column)

        if target_column not in processed_df.columns:
            return Response({"error": f"Target column '{target_column}' not found in dataset."}, status=400)

        X = processed_df.drop(columns=[target_column])
        y = processed_df[target_column]    
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
        
        # Load model if provided, otherwise train default models
        models = []
        if model_file:
            model = joblib.load(model_file)
            models.append({
                'model': model,
                'name': 'UserModel'
            })
        else:
            models.extend([
                {'model': LogisticRegression(max_iter=1000), 'name': 'LogisticRegression'},
                {'model': DecisionTreeClassifier(), 'name': 'DecisionTree'},
                {'model': RandomForestClassifier(), 'name': 'RandomForest'},
                {'model': GradientBoostingClassifier(), 'name': 'GradientBoosting'},
                {'model': SVC(probability=True), 'name': 'SVC'},
                {'model': MLPClassifier(max_iter=1000), 'name': 'MLP'},
                {'model': KNeighborsClassifier(), 'name': 'KNeighbors'}
            ])
        from .utils import evaluate_model

        # Evaluate each model
        results = []
        for model_info in models:
            try:
                result = evaluate_model(
                    model_info['model'], 
                    X_train, X_test, y_train, y_test, 
                    sensitive_attributes,
                    model_info['name']
                )
                results.append(result)
            except Exception as e:
                print(f"Error evaluating {model_info['name']}: {str(e)}")
        
        # Generate visualizations
        fairness_plot = generate_fairness_plot(results)
        bias_plot = generate_bias_plot(results[0]['detailed_fairness'])
        
        # Prepare response data
        response_data = {
            'dataset_name': csv_file.name,
            'model_name': model_file.name if model_file else 'Multiple Models',
            'upload_date': pd.Timestamp.now().strftime('%Y-%m-%d'),
            'status': 'completed',
            'overall_fairness_score': results[0]['fairness_metrics']['overall_score'],
            'sensitive_attributes': sensitive_attributes,
            'metrics': {
                'demographic_parity': results[0]['fairness_metrics']['demographic_parity'],
                'equalized_odds': results[0]['fairness_metrics']['equalized_odds'],
                'calibration': results[0]['fairness_metrics']['calibration'],
                'individual_fairness': results[0]['fairness_metrics']['individual_fairness']
            },
            'bias_detected': [{
                'attribute': attr,
                'severity': 'high' if (metrics['overall_score'] / 10) <= 0.5 else 
                           'medium' if (metrics['overall_score'] / 10) <= 0.7 else 'low',
                'score': metrics['overall_score'] / 10
            } for attr, metrics in results[0]['detailed_fairness'].items()],
            'suggestions': generate_mitigation_suggestions(results[0]['detailed_fairness']),
            'models_comparison': [{
                'name': r['model_name'],
                'accuracy': r['accuracy'],
                'f1_score': r['f1_score'],
                'demographic_parity': r['fairness_metrics']['demographic_parity'],
                'equalized_odds': r['fairness_metrics']['equalized_odds'],
                'calibration': r['fairness_metrics']['calibration'],
                'individual_fairness': r['fairness_metrics']['individual_fairness'],
                'overall_score': r['fairness_metrics']['overall_score']
            } for r in results],
            'visualizations': {
                'fairness_plot': fairness_plot,
                'bias_plot': bias_plot
            }
        }
        
        # Store in MongoDB and create report
        report = AnalysisReport.create_report(
            user_id=request.user.id if request.user.is_authenticated else 'anonymous',
            data=response_data,
            files={'dataset': csv_file, 'model': model_file} if model_file else {'dataset': csv_file}
        )
        
        return Response({
            'analysis_id': str(report["mongo_id"]),
            'status': 'success'
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
from bson import ObjectId

@api_view(['GET'])
def get_report(request, report_id):
    try:
        # Get report from MongoDB
        report = AnalysisReport.db.reports.find_one({'_id': ObjectId(report_id)})
        
        if not report:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Convert ObjectId to string
        report['_id'] = str(report['_id'])
        
        return Response(report, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
# def preprocess_data(df, sensitive_attributes):
#     # Simple placeholder logic (customize as needed)
#     df = df.dropna()  # Drop missing rows
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df[col] = df[col].astype(str)
#     if 'target' not in df.columns:
#         raise ValueError("Missing 'target' column in dataset")
#     return df
# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna()
    
#     # Ensure sensitive columns are strings (for grouping)
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df[col] = df[col].astype(str)

#     # Ensure target column is numeric (for classification)
#     if target_column not in df.columns:
#         raise ValueError(f"Target column '{target_column}' not found in dataset")
    
#     # Optional: Convert binary categorical target to 0/1
#     if df[target_column].dtype == object:
#         df[target_column] = df[target_column].astype('category').cat.codes

#     return df


# Get CSV column names (for frontend UI)
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import pandas as pd

import traceback
@api_view(['POST'])
@parser_classes([MultiPartParser])
def get_csv_columns(request):
    csv_file = request.FILES.get('csv_file')
    if not csv_file:
        return Response({"error": "CSV file is missing"}, status=400)

    try:
        print(f"[DEBUG] File received: {csv_file.name}")
        df = pd.read_csv(csv_file)
        # Drop completely empty columns like Unnamed: 32
        df.dropna(axis=1, how='all', inplace=True)

        # Drop completely empty rows
        df.dropna(axis=0, how='all', inplace=True)

        # Optional: remove unnecessary index columns
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

        # Debug again
        print("[DEBUG] Cleaned shape:", df.shape)
        print(f"[DEBUG] Columns: {df.columns.tolist()}")
        return Response({"columns": df.columns.tolist()})
    except Exception as e:
        tb = traceback.format_exc()
        print("[ERROR] Failed to read CSV:", tb)
        return Response({"error": str(e), "trace": tb}, status=400)


# sensitive_attributes = json.loads(request.data.get('sensitive_attributes', '[]'))
# target_column = request.data.get('target_column')
