import os
import random
import string
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi import FastAPI

load_dotenv()

app = FastAPI()

MONGO_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

app.mongodb_client = MongoClient(MONGO_CONNECTION_STRING)

app.database = app.mongodb_client["productData"]

amzn_product_data = app.database["amazonProductData"]

def generate_asin():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

sample_data = [
    {
        "title": f"product{i}",
        "buy_box": round(random.uniform(0, 1000), 2),
        "ASIN": generate_asin()

    }
    for i in range(1, 101)
]

amzn_product_data.insert_many(sample_data)
"""
result = amzn_product_data.delete_many({})

print(result)
"""


app.mongodb_client.close()


