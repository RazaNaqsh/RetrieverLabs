from typing import List,Dict

def build_rag_prompt(query: str, chunks: List[Dict]) -> str:
    context = "\n\n".join(
        f"- {chunk['text']}" for chunk in chunks
    )
    
    return f"""
You are answering a question using the provided context.
Answer strictly from the context. If the answer is not present, say you don't know.
Context:
{context}

Question:
{query}

Answer:
""".strip()