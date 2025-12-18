import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing from environment variables.")

# Initialize Client
client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

def call_gemini_api(model, messages):
    """
    Generic function to call Gemini via OpenAI SDK.
    
    Args:
        model (str): The model name (e.g., "gemini-1.5-flash")
        messages (list): The list of message dictionaries (role, content).
        
    Returns:
        str: The content string from the response.
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            # We keep JSON object enforcement here since your prompt relies on it,
            # but you could also make this a parameter if you wanted.
            response_format={"type": "json_object"} 
        )
        
        return response.choices[0].message.content

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise e