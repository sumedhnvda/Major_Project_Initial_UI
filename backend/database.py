import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Directly use your SRV connection string
MONGODB_URL = os.getenv("MONGODB_URL")

DATABASE_NAME = "qa_pair"  # new DB

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        self.client = AsyncIOMotorClient(MONGODB_URL)
        print("Connected to MongoDB Atlas")

    def close(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

    def get_db(self):
        return self.client[DATABASE_NAME]

    def get_books_db(self):
        return self.client["textfrombooks"]

db = Database()
