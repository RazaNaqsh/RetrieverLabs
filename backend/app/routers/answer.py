from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.llm.answer import generate_answer


router = APIRouter()

class RetrievedChunks(BaseModel):
    id: int
    text: str
    score: float
    
class AnswerRequest(BaseModel):
    query: str
    chunks: List[RetrievedChunks]
    
class AnswerResponse(BaseModel):
    answer: str
    


@router.post("/answer", response_model=AnswerResponse)
async def answer(payload:AnswerRequest):
    answer_text = generate_answer(
        query=payload.query,
        retrieved_chunks= [chunk.model_dump() for chunk in payload.chunks]
    )
    return {"answer": answer_text}