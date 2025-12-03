from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
import json
import codecs
import codecs
import os
import shutil
from database import db
from fastapi import BackgroundTasks
from utils.ocr import ocr_book_with_parallel_pages
from utils.clean import clean_text, clean_file

# Data Models
class Translation(BaseModel):
    instruction: str
    response: str

class QAPair(BaseModel):
    instruction: str
    response: str
    translation_en: Optional[Translation] = None
    source: Optional[str] = "manual"

class QAPairResponse(QAPair):
    id: str

# App Lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    yield
    db.close()

app = FastAPI(lifespan=lifespan)

# CORS Setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://saraswati.sumedhnavuda.com/",
    "https://saraswati.sumedhnavuda.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Endpoints

@app.get("/")
async def root():
    return {"message": "Tulu SLM Data Collection API"}

@app.post("/api/submit", response_model=dict)
async def submit_qa_pair(qa: QAPair):
    try:
        data = qa.dict()
        result = await db.get_db().qa_pairs.insert_one(data)
        return {"id": str(result.inserted_id), "message": "Submitted successfully"}
    except Exception as e:
        print(f"Error submitting data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        decoded = codecs.decode(contents, "utf-8")
        
        items_to_insert = []
        
        if file.filename.endswith('.json'):
            try:
                data = json.loads(decoded)
                if isinstance(data, list):
                    for item in data:
                        # Validate and normalize
                        if "instruction" in item and "response" in item:
                            items_to_insert.append({
                                "instruction": item["instruction"],
                                "response": item["response"],
                                "translation_en": item.get("translation_en"),
                                "source": "json_upload"
                            })
                elif isinstance(data, dict):
                     if "instruction" in data and "response" in data:
                            items_to_insert.append({
                                "instruction": data["instruction"],
                                "response": data["response"],
                                "translation_en": data.get("translation_en"),
                                "source": "json_upload"
                            })
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON format")
                
        elif file.filename.endswith('.csv'):
            import csv
            import io
            csv_reader = csv.DictReader(io.StringIO(decoded))
            for row in csv_reader:
                # Flexible column matching for CSV
                instruction = row.get('instruction') or row.get('question') or row.get('q')
                response = row.get('response') or row.get('answer') or row.get('a')
                
                if instruction and response:
                    items_to_insert.append({
                        "instruction": instruction,
                        "response": response,
                        "source": "csv_upload"
                    })
        else:
             raise HTTPException(status_code=400, detail="Unsupported file format. Use .json or .csv")
        
        if items_to_insert:
            result = await db.get_db().qa_pairs.insert_many(items_to_insert)
            return {"message": f"Successfully uploaded {len(result.inserted_ids)} pairs"}
        else:
            return {"message": "No valid pairs found in file"}
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/data", response_model=List[QAPairResponse])
async def get_data():
    try:
        cursor = db.get_db().qa_pairs.find().limit(100).sort("_id", -1)
        results = []
        async for document in cursor:
            results.append(QAPairResponse(
                id=str(document["_id"]),
                instruction=document.get("instruction", document.get("question", "")), # Fallback for old data
                response=document.get("response", document.get("answer", "")),       # Fallback for old data
                translation_en=document.get("translation_en"),
                source=document.get("source", "unknown")
            ))
        return results
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Book Upload & Processing
UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def process_book_background(file_path: str, filename: str, book_id: str):
    ocr_output_path = os.path.join(UPLOAD_FOLDER, f"{book_id}_ocr.txt")
    cleaned_output_path = os.path.join(UPLOAD_FOLDER, f"{book_id}_cleaned.txt")
    
    try:
        # 1. OCR
        print(f"Starting OCR for {filename}...")
        success = ocr_book_with_parallel_pages(file_path, ocr_output_path)
        
        if not success:
             print(f"OCR failed for {filename}")
             db.get_books_db().books.update_one(
                {"_id": book_id},
                {"$set": {"status": "failed", "error": "OCR failed"}}
             )
             # Cleanup
             if os.path.exists(file_path):
                os.remove(file_path)
             if os.path.exists(ocr_output_path):
                os.remove(ocr_output_path)
             print(f"OCR failed for {filename}. Cleanup complete.")
             return

        # 2. Clean
        print(f"Starting cleaning for {filename}...")
        
        kept_lines = clean_file(ocr_output_path, cleaned_output_path)
        
        # Read cleaned content
        with open(cleaned_output_path, "r", encoding="utf-8") as f:
            cleaned_content = f.read()
            
        print(f"Cleaning complete for {filename}. Kept {kept_lines} lines. Content length: {len(cleaned_content)}")

        # 3. Store in DB
        db.get_books_db().books.update_one(
            {"_id": book_id},
            {"$set": {
                "status": "completed",
                "content": cleaned_content,
                "kept_lines": kept_lines,
                "processed_at": str(datetime.now())
            }}
        )
        
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(ocr_output_path):
            os.remove(ocr_output_path)
        if os.path.exists(cleaned_output_path):
            os.remove(cleaned_output_path)
        print(f"Cleanup complete for {filename}")
        
    except Exception as e:
        print(f"Error processing book {filename}: {e}")
        db.get_books_db().books.update_one(
            {"_id": book_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
        # Cleanup on error too
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(ocr_output_path):
            os.remove(ocr_output_path)
        if os.path.exists(cleaned_output_path):
            os.remove(cleaned_output_path)

from datetime import datetime
import uuid

@app.post("/api/books/upload")
async def upload_book(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    try:
        # Generate ID
        book_id = str(uuid.uuid4())
        
        # Save file
        file_path = os.path.join(UPLOAD_FOLDER, f"{book_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create DB entry
        book_entry = {
            "_id": book_id,
            "filename": file.filename,
            "status": "processing",
            "uploaded_at": str(datetime.now())
        }
        await db.get_books_db().books.insert_one(book_entry)
        
        # Trigger background task
        background_tasks.add_task(process_book_background, file_path, file.filename, book_id)
        
        return {"message": "Book uploaded and processing started", "book_id": book_id}
        
    except Exception as e:
        print(f"Error uploading book: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/books")
async def get_books():
    try:
        cursor = db.get_books_db().books.find({}, {"content": 0}).sort("uploaded_at", -1)
        books = await cursor.to_list(length=100)
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/books/{book_id}")
async def get_book_content(book_id: str):
    try:
        book = await db.get_books_db().books.find_one({"_id": book_id})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return book
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/books/download/all")
async def download_all_books():
    try:
        cursor = db.get_books_db().books.find({"status": "completed"})
        
        async def iter_books():
            async for book in cursor:
                if "content" in book and book["content"]:
                    yield f"\n\n--- Book: {book['filename']} ---\n\n"
                    yield book["content"]
        
        return StreamingResponse(
            iter_books(),
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=all_tulu_books.txt"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
