import os
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi import FastAPI

load_dotenv()

app = FastAPI

MONGO_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

app.mongodb_client = MongoClient(MONGO_CONNECTION_STRING)

app.database = app.mongodb_client["sample_mflix"]

movies = app.database["movies"]


for movie in movies.find():
    print(movie)


