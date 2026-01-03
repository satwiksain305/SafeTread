from pymongo import MongoClient

uri = "mongodb+srv://safetread_user:Safetread123@safetread.io1oksf.mongodb.net/SafeTreadDB?retryWrites=true&w=majority&appName=SafeTread"

client = MongoClient(uri)
db = client["SafeTreadDB"]

print("✅ Connected to MongoDB successfully!")
print("Collections:", db.list_collection_names())
