from typing import List, Dict
from sentence_transformers import SentenceTransformer

_model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_chunks(chunks: List[Dict]) -> List[Dict]:
    """
    Convert chunk texts into embedding vectors.
    Each chunk must contain: { id, text }
    """
    
    if not chunks:
        return []
    
    texts = [chunk["text"] for chunk in chunks]
    
    # Generate embeddings
    vectors = _model.encode(texts, convert_to_numpy=True)
    
    embeddings = []
    for idx, vector in enumerate(vectors):
        embeddings.append({
            "id":chunks[idx]["id"],
            "vector":vector.tolist()
        })
    
    return embeddings