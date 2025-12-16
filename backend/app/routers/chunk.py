from fastapi import APIRouter
from pydantic import BaseModel
from services.chunking import simple_chunker

router = APIRouter()

class ChunkRequest(BaseModel):
    text: str
    
class ChunkResponse(BaseModel):
    chunks: list
    

@router.post("/chunk", response_model=ChunkResponse)
async def chunk_text(payload:ChunkRequest):
    chunks = simple_chunker(payload.text)
    return {"chunks":chunks}
