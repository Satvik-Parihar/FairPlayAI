from pymongo import MongoClient

uri = "mongodb://kasak:Project%40123@127.0.0.1:27017/FairPlayAI?authSource=admin"
client = MongoClient(uri)

db = client["FairPlayAI"]
collection = db["test_collection"]

try:
    result = collection.insert_one({"test": "check_auth"})
    print("✅ Insert succeeded. ID:", result.inserted_id)
except Exception as e:
    print("❌ Insert failed:", e)
