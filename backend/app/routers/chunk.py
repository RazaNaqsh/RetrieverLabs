from fastapi import APIRouter
from pydantic import BaseModel
from app.services.chunking.simple_chunker import simple_chunk

router = APIRouter()

class ChunkRequest(BaseModel):
    text: str
    
class ChunkResponse(BaseModel):
    chunks: list
    

@router.post("/chunk", response_model=ChunkResponse)
async def chunk_text(payload:ChunkRequest):
    chunks = simple_chunk(payload.text)
    return {"chunks":chunks}
