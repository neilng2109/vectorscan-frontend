import os
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

# This part remains the same
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index("vectorscan-faults")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def query_fault_description_safe(fault_input, ship_filter=None):
    try:
        if not PINECONE_API_KEY or not OPENAI_API_KEY:
            return "Error: API keys not configured."
        
        response = openai_client.embeddings.create(input=fault_input, model="text-embedding-ada-002")
        fault_embedding = response.data[0].embedding
        
        query_filter = {"ship": {"$eq": ship_filter}} if ship_filter and ship_filter != 'all' else None
        
        results = index.query(
            vector=fault_embedding,
            top_k=3,
            include_metadata=True,
            filter=query_filter
        )
        
        context = ""
        if results.matches:
            for match in results.matches:
                metadata = match.metadata
                context += f"Similar fault: {metadata.get('fault', 'N/A')} on {metadata.get('equipment', 'N/A')} - {metadata.get('cause', 'N/A')}. Resolution: {metadata.get('resolution', 'N/A')}\n"
        else:
            context = "No similar faults found."
        
        # --- THIS IS THE CORRECTED SECTION ---
        # The multi-line string is now properly formatted to avoid indentation errors.
        prompt = (
            f"You are a maritime fault diagnosis expert.\n"
            f"Fault: '{fault_input}'\n"
            f"Ship Filter: {ship_filter or 'All'}\n\n"
            f"Similar past faults:\n{context}\n\n"
            f"Provide a concise diagnosis with cause and resolution in 50 words or less.\n"
            f"Format as: **Diagnosis:** [text]\n"
            f"**Cause:** [text]\n"
            f"**Resolution:** [text]"
        )
        # --- END OF CORRECTION ---

        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        
        diagnosis = ai_response.choices[0].message.content.strip()
        
        if context and context != "No similar faults found.":
            diagnosis += f"\n\n**Similar Past Faults:**\n{context}"
        
        diagnosis += "\n\n**Status:** AI-powered response with Pinecone similarity search"
        
        return diagnosis
        
    except Exception as e:
        print(f"AI diagnosis failed: {str(e)}")
        return f"Error during AI query: {str(e)}."
```

### Next Steps

You are currently on the `temp-rollback` branch. You need to commit this fix and push it to the server.

1.  **Save** the corrected `safe_ai_query.py` file.
2.  In your command line (in the backend directory), run the following commands:
    ```bash
    git add .
    git commit -m "fix: Correct indentation in safe_ai_query"
    git push heroku temp-rollback:main --force
    

