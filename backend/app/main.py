from fastapi import FastAPI
from app.routers import chunk

app = FastAPI()

app.include_router(chunk.router)

@app.get("/ping")
async def root():
    return {"message":"Hello ping"}