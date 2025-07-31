# # # from django.db import models


# # # class AnalysisResult(models.Model):
# # #     analysis_id = models.CharField(max_length=100, unique=True)
# # #     created_at = models.DateTimeField(auto_now_add=True)
# # #     username = models.CharField(max_length=100)
# # #     sensitive_attributes = models.JSONField()
# # #     metrics = models.JSONField()
# # #     suggestions = models.JSONField()
# # #     graph_urls = models.JSONField()

# # #     def __str__(self):
# # #         return self.analysis_id
# # from django.db import models
# # from pymongo import MongoClient
# # import gridfs
# # import json
# # from bson import ObjectId

# # # class AnalysisReport(models.Model):
# # # ✅ FIXED
# # class AnalysisReport:

# #     user_id = models.CharField(max_length=100)
# #     created_at = models.DateTimeField(auto_now_add=True)
# #     mongo_id = models.CharField(max_length=100)
# #     status = models.CharField(max_length=20, default='processing')
    
# #     # Connect to MongoDB
# #     client = MongoClient('mongodb://localhost:27017/')
# #     db = client['fairness_audit']
# #     fs = gridfs.GridFS(db)
    
# #     @classmethod
# #     def create_report(cls, user_id, data, files=None):
# #         # Store large data in MongoDB
# #         result_id = cls.db.reports.insert_one(data).inserted_id
        
# #         # Store files in GridFS if needed
# #         file_ids = {}
# #         if files:
# #             for name, file in files.items():
# #                 file_id = cls.fs.put(file.read(), filename=file.name)
# #                 file_ids[name] = str(file_id)
        
# #         # Create Django record
# #         report = cls.objects.create(
# #             user_id=user_id,
# #             mongo_id=str(result_id)
# #         )
        
# #         return report
# from django.db import models
# from pymongo import MongoClient
# import gridfs
# from bson import ObjectId


# # --- Option B: Split SQL and MongoDB logic ---
# from django.db import models

# class AnalysisReportRecord(models.Model):
#     user_id = models.CharField(max_length=100)
#     mongo_id = models.CharField(max_length=100)  # Links to MongoDB report _id
#     created_at = models.DateTimeField(auto_now_add=True)
#     status = models.CharField(max_length=20, default='processing')

#     def __str__(self):
#         return f"Report by {self.user_id} | MongoID: {self.mongo_id}"

# # --- MongoDB logic (not a Django model) ---
# from pymongo import MongoClient
# import gridfs
# from bson import ObjectId
# from datetime import datetime

# class AnalysisReport:
#     # client = MongoClient('mongodb://localhost:27017/')
#     # db = client['fairness_audit']
#     client = MongoClient('mongodb://kasak:Project%40123@127.0.0.1:27017/fairness_audit?authSource=admin')
#     db = client['FairPlayAI']

#     fs = gridfs.GridFS(db)

#     @classmethod
#     def create_report(cls, user_id, data, files=None):
#         result_id = cls.db.reports.insert_one({
#             **data,
#             "user_id": user_id,
#             "created_at": datetime.utcnow(),
#             "status": "completed"
#         }).inserted_id

#         if files:
#             for name, file in files.items():
#                 cls.fs.put(file.read(), filename=file.name)

#         return {"mongo_id": str(result_id)}

#     @classmethod
#     def get_report_data(cls, mongo_id):
#         return cls.db.reports.find_one({"_id": ObjectId(mongo_id)})
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