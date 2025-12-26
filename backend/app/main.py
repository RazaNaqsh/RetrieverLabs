from fastapi import FastAPI
from app.routers import chunk
from app.routers import embed
from app.routers import retrieve
from app.routers import answer

app = FastAPI()

app.include_router(chunk.router)
app.include_router(embed.router)
app.include_router(retrieve.router)
app.include_router(answer.router)

@app.get("/health")
async def root():
    return {"message":"Healthy!"}