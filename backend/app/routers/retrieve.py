from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.retrieval.retriever import retrieve_top_k


router = APIRouter()


class EmbeddedChunk(BaseModel):
    id: int
    text: str
    vector: List[float]
    
class RetrieveRequest(BaseModel):
    query: str
    embeddings: List[EmbeddedChunk]
    top_k: int = 3
    
class RetrievedChunk(BaseModel):
    id: int
    text: str
    score: float
    
class RetrieveResponse(BaseModel):
    results: List[RetrievedChunk]
    

@router.post("/retrieve", response_model=RetrieveResponse)
async def retrieve(payload:RetrieveRequest):
    results = retrieve_top_k(
        query=payload.query,
        chunks=[chunk.model_dump() for chunk in payload.embeddings],
        top_k=payload.top_k,
    )
    return {"results": results}