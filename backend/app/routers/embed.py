from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.embedding.sentence_transformer import embed_chunks


router = APIRouter()

class Chunk(BaseModel):
    id: int
    text: str
    
class EmbedRequest(BaseModel):
    chunks: List[Chunk]
    
class Embedding(BaseModel):
    id: int
    vector: List[float]
    
class EmbedResponse(BaseModel):
    embeddings: List[Embedding]
    

@router.post("/embed", response_model=EmbedResponse)
async def embed(payload:EmbedRequest):
    embeddings = embed_chunks([chunk.model_dump() for chunk in payload.chunks])
    return {"embeddings":embeddings}