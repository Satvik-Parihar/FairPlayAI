
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