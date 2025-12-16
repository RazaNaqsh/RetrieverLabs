from typing import List,Dict

def simple_chunk(text: str) -> List[Dict]:
    """
    Split text into chunks based on paragraph boundaries.
    This is intentionally simple and deterministic.
    """
    
    text = text.strip()
    
    if not text:
        return []
    
    paragraphs = text.split("\n\n")
    
    chunks = []
    for idx,para in enumerate(paragraphs):
        cleaned = para.strip()
        if cleaned:
            chunks.append({
                "id":idx,
                "text":cleaned
            })
    
    return chunks