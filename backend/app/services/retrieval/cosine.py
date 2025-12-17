import math
from typing import List

def cosine_similarity(vec1: List[float], vec2: List[float])-> float:
    """
    Compute cosine similarity between two vectors.
    Returns value in range [-1, 1].
    """
    
    if len(vec1) != len(vec2):
        raise ValueError("Vectors must be of same length")
    
    dot_product = sum(a * b for a,b in zip(vec1,vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product/ (norm1 * norm2)