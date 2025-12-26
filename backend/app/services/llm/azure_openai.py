from app.services.llm.base import LLMProvider

from openai import AzureOpenAI
import os

class AzureOpenAIProvider(LLMProvider):
    def __init__(self):
        self.client=AzureOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION")
        )
        self.deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
        
    def generate(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.deployment,
            messages=[
                {"role":"system", "content":"You are a helpful assistant"},
                {"role":"user","content":prompt}
            ]
        )
        return response.choices[0].message.content