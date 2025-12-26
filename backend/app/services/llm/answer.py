from app.services.llm.azure_openai import AzureOpenAIProvider
from app.services.llm.prompt import build_rag_prompt

def generate_answer(query: str, retrieved_chunks: list) -> str:
    llm = AzureOpenAIProvider()
    
    prompt = build_rag_prompt(
        query=query,
        chunks=retrieved_chunks
    )
    
    return llm.generate(prompt)