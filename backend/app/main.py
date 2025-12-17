from fastapi import FastAPI
from app.routers import chunk
from app.routers import embed

app = FastAPI()

app.include_router(chunk.router)
app.include_router(embed.router)

@app.get("/health")
async def root():
    return {"message":"Healthy!"}