import os
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi import FastAPI

load_dotenv()

app = FastAPI

MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

app.mongodb_client = MongoClient(MONGO_CONNECTION_STRING)

app.database = app.mongodb_client["productData"]

amzn_product_data = app.database["amazonProductData"]

# amzn_product_data.delete_many({})
# amzn_product_data.insert_many(sample_data)

app.mongodb_client.close()

