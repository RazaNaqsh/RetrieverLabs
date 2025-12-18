from typing import List, Dict
from app.services.retrieval.cosine import cosine_similarity
from app.services.embedding.sentence_transformer import embed_chunks


def retrieve_top_k(query: str, chunks: List[Dict], top_k: int = 3) -> List[Dict]:
    """
    Retrieve top-K most similar chunks for a query.
    """
    
    if not chunks:
        return []
    
    # embed the query
    query_embedding = embed_chunks([{"id": -1, "text":query}])[0]["vector"]
    
    results = []
    
    # compare with chunk embeddings
    # you get a score, from the cosine similarity function
    for chunk in chunks:
        score = cosine_similarity(query_embedding,chunk["vector"])

        results.append({
            "id": chunk["id"],
            "text": chunk["text"],
            "score": score,
        })
    
    
    # sort using the score
    results.sort(key=lambda x: x["score"],reverse=True)
    
    # return the top k
    return results[:top_k]