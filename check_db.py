#!/usr/bin/env python
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['SafeTreadDB']

# Check predictions
count = db.tire_predictions.count_documents({})
print(f'✓ Total predictions in database: {count}')

if count > 0:
    print('\nMost recent predictions:')
    preds = list(db.tire_predictions.find().sort('_id', -1).limit(5))
    for i, p in enumerate(preds, 1):
        print(f'{i}. {p.get("status")} - {p.get("wear_percentage")}% wear - Model: {p.get("model_used")} - User: {p.get("user_email")}')
else:
    print('No predictions found. Upload an image first!')
