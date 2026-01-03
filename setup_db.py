from pymongo import MongoClient

# Connect to MongoDB
uri = "mongodb+srv://safetread_user:Safetread123@safetread.io1oksf.mongodb.net/SafeTreadDB?retryWrites=true&w=majority&appName=SafeTread"
client = MongoClient(uri)
db = client["SafeTreadDB"]

# Define collections
collections = ["users", "tire_data", "reports"]

# Create them if not exist
for name in collections:
    if name not in db.list_collection_names():
        db.create_collection(name)
        print(f"✅ Created collection: {name}")
    else:
        print(f"ℹ️ Collection already exists: {name}")

print("All collections ready ✅")
