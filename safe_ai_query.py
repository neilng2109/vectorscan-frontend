import os
from dotenv import load_dotenv

try:
    from pinecone import Pinecone # Updated import
    from openai import OpenAI
except ImportError as e:
    print(f"Import error: {str(e)}. Ensure pinecone and openai are installed.")

# Load environment variables (relative path for flexibility)
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)  # Falls back to current dir if not found
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def query_fault_description_safe(fault_input, ship_filter=None):
    """
    Fault diagnosis using Pinecone and OpenAI—no mock fallback.
    """
    try:
        # Debug: Log API key status
        print(f"PINECONE_API_KEY exists: {bool(PINECONE_API_KEY)}")
        print(f"OPENAI_API_KEY exists: {bool(OPENAI_API_KEY)}")
        print(f"PINECONE_API_KEY value: {PINECONE_API_KEY[:20] if PINECONE_API_KEY else 'None'}...")
        print(f"OPENAI_API_KEY value: {OPENAI_API_KEY[:20] if OPENAI_API_KEY else 'None'}...")
        
        # Check if API keys are available
        if not PINECONE_API_KEY or not OPENAI_API_KEY or PINECONE_API_KEY == "your-pinecone-api-key-here" or OPENAI_API_KEY == "your-openai-api-key-here":
            print("Key check failed - returning error")
            return "Error: API keys not configured or invalid—please update .env and retry."
        
        print("Key check passed - proceeding to AI diagnosis")
        print(f"Using AI-powered diagnosis for: {fault_input}")
        
        # Initialize clients
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index("vectorscan-faults")
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Generate embedding
        response = openai_client.embeddings.create(input=fault_input, model="text-embedding-ada-002")
        fault_embedding = response.data[0].embedding
        
        # Query Pinecone with ship filter (commented for now)
        # query_filter = {"ship": ship_filter} if ship_filter and ship_filter != 'All' else None
        results = index.query(
            vector=fault_embedding,
            top_k=3,
            include_metadata=True,
            # filter=query_filter
        )
        
        print(f"Pinecone returned {len(results['matches'])} matches")
        
        if results['matches']:
            print("Sample metadata:", results['matches'][0]['metadata'])
        
        # Generate AI diagnosis
        context = ""
        if results['matches']:
            for match in results['matches'][:2]:
                metadata = match.get('metadata', {})
                context += f"Similar fault: {metadata.get('fault', 'Unknown')} on {metadata.get('equipment', 'Unknown equipment')} - {metadata.get('cause', 'Unknown cause')}. Resolution: {metadata.get('resolution', 'N/A')}\n"
        else:
            context = "No similar faults found."
        
        prompt = f"""You are a maritime fault diagnosis expert. 
        Fault: '{fault_input}'
        Ship Filter: {ship_filter or 'All'}
        
        Similar past faults:
        {context}
        
        Provide a concise diagnosis with cause and resolution in 50 words or less.
        Format as: **Diagnosis:** [text]
        **Cause:** [text]
        **Resolution:** [text]"""
        
        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        
        diagnosis = ai_response.choices[0].message.content.strip()
        
        if context and context != "No similar faults found.":
            diagnosis += f"\n\n**Similar Past Faults:**\n{context}"
        
        diagnosis += "\n\n**Status:** AI-powered response with Pinecone similarity search"
        
        print("AI diagnosis complete - returning result")
        return diagnosis
        
    except Exception as e:
        print(f"AI diagnosis failed: {str(e)}")
        return f"Error during AI query: {str(e)}. Please try again or contact support."

if __name__ == "__main__":
    # Optional test call - remove if not needed
    test_result = query_fault_description_safe("pump vibration", ship_filter="Iona")
    print(test_result)