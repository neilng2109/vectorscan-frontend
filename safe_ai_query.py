import os
import json # <-- Make sure json is imported
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

# --- Environment Setup ---
# This part remains the same
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# --- API Clients Initialization ---
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index("vectorscan-faults")
openai_client = OpenAI(api_key=OPENAI_API_KEY)


def query_fault_description_safe(fault_input, ship_filter=None):
    """
    This function processes a fault query through the full AI pipeline:
    1. Creates a vector embedding of the fault text using OpenAI.
    2. Queries the Pinecone vector database to find similar past faults.
    3. Sends the context to an OpenAI chat model to generate a diagnosis.
    """
    try:
        # --- Pre-computation Checks ---
        if not PINECONE_API_KEY or not OPENAI_API_KEY:
            return "Error: API keys not configured."
        
        print("\n--- [START] AI Diagnosis Pipeline ---")
        print(f"Input: '{fault_input}', Ship Filter: '{ship_filter}'")

        # --- Step 1: Create OpenAI Embedding ---
        print("[1/4] Creating embedding with OpenAI...")
        response = openai_client.embeddings.create(input=fault_input, model="text-embedding-ada-002")
        fault_embedding = response.data[0].embedding
        print("[1/4] Embedding created successfully.")

        # --- Step 2: Query Pinecone ---
        print("[2/4] Querying Pinecone for similar faults...")
        query_filter = {"ship": {"$eq": ship_filter}} if ship_filter and ship_filter != 'all' else None
        results = index.query(
            vector=fault_embedding,
            top_k=3,
            include_metadata=True,
            filter=query_filter
        )
        print(f"[2/4] Pinecone query successful. Found {len(results.matches)} matches.")

        # --- Step 3: Build Context from Pinecone Results ---
        print("[3/4] Building context for AI model...")
        context = ""
        if results.matches:
            for match in results.matches:
                metadata = match.metadata
                context += f"Similar fault: {metadata.get('fault', 'N/A')} on {metadata.get('equipment', 'N/A')} - {metadata.get('cause', 'N/A')}. Resolution: {metadata.get('resolution', 'N/A')}\n"
        else:
            context = "No similar faults found in the historical data."
        print("[3/4] Context built successfully.")

        # --- Step 4: Generate Diagnosis with OpenAI Chat Model ---
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
        
        print("[4/4] Sending prompt to OpenAI for final diagnosis...")
        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150 # Increased slightly for better responses
        )
        diagnosis = ai_response.choices[0].message.content.strip()
        print("[4/4] Diagnosis received from OpenAI successfully.")

        # --- Final Formatting ---
        if context and "No similar faults found" not in context:
            diagnosis += f"\n\n**Similar Past Faults:**\n{context}"
        
        diagnosis += "\n\n**Status:** AI-powered response with Pinecone similarity search"
        print("--- [END] AI Diagnosis Pipeline ---")
        return diagnosis
        
    except Exception as e:
        # --- ENHANCED ERROR HANDLING ---
        # This block will now give us much more detail if anything fails.
        print("\n--- ERROR: AI Diagnosis Pipeline Failed ---")
        print(f"An exception occurred while processing the fault: '{fault_input}'")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {e}")
        print("-------------------------------------------\n")
        return f"Error: An exception occurred during the AI query process. Details: {str(e)}"
