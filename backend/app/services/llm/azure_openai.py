from app.services.llm.base import LLMProvider
from dotenv import load_dotenv
from openai import AzureOpenAI
import os

load_dotenv()

class AzureOpenAIProvider(LLMProvider):
    def __init__(self):
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        
        if not api_key or not endpoint:
            raise ValueError("Missing Azure OpenAI Environment Variables!")

        self.client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=api_key,
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