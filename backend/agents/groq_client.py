import os
import json
import logging
from typing import Optional, Dict, Any
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aivoa.groq")

def get_groq_client(api_key: Optional[str] = None) -> Optional[Groq]:
    """Returns a Groq client instance if API key is provided or present in environment."""
    key = api_key or os.getenv("GROQ_API_KEY")
    if not key or key.strip() == "":
        return None
    try:
        return Groq(api_key=key.strip())
    except Exception as e:
        logger.warning(f"Failed to initialize Groq client: {e}")
        return None

def call_groq_json(
    prompt: str,
    system_instruction: str,
    model: str = "gemma2-9b-it",
    api_key: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Calls Groq LLM with JSON response format."""
    client = get_groq_client(api_key)
    if not client:
        return None

    # Supported Groq models per instructions: gemma2-9b-it, llama-3.3-70b-versatile
    valid_models = ["gemma2-9b-it", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    selected_model = model if model in valid_models else "gemma2-9b-it"

    try:
        # Note: gemma2-9b-it might not support response_format={"type": "json_object"} in all Groq regions,
        # so we ask for pure JSON in prompt and parse flexibly.
        completion = client.chat.completions.create(
            model=selected_model,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2048,
        )
        content = completion.choices[0].message.content.strip()

        # Clean markdown code blocks if returned
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        # Find first { and last }
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1:
            content = content[start:end+1]

        return json.loads(content)
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None

