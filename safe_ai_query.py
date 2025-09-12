import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index("vectorscan-faults")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def query_fault_description_safe(fault_input, ship_filter=None):
    """
    Performs a full RAG query: embedding, Pinecone search, and OpenAI generation.
    Returns a rich, structured JSON object with a detailed diagnosis.
    """
    print("--- Starting Enhanced AI Diagnosis ---")
    if not PINECONE_API_KEY or not OPENAI_API_KEY:
        return {"error": "API keys not configured."}

    try:
        # Step 1: Create embedding
        print(f"Step 1: Creating embedding for '{fault_input}'...")
        response = openai_client.embeddings.create(input=fault_input, model="text-embedding-ada-002")
        fault_embedding = response.data[0].embedding
        print("Step 1: Embedding created.")

        # Step 2: Query Pinecone
        print(f"Step 2: Querying Pinecone with ship filter '{ship_filter}'...")
        query_filter = {"ship": {"$eq": ship_filter}} if ship_filter and ship_filter != 'all' else None
        results = index.query(
            vector=fault_embedding,
            top_k=3,
            include_metadata=True,
            filter=query_filter
        )
        print("Step 2: Pinecone query successful.")
        
        context = ""
        if results.matches:
            for match in results.matches:
                metadata = match.metadata
                context += f"- Fault: {metadata.get('fault', 'N/A')}, Cause: {metadata.get('cause', 'N/A')}, Resolution: {metadata.get('resolution', 'N/A')}\n"
        else:
            context = "No similar historical faults were found in the database for this specific query."
        
        # --- ENHANCED PROMPT v2 ---
        prompt = (
            "You are a Chief Marine Engineer acting as an expert diagnostician. Your primary goal is to provide a detailed and actionable analysis based on the provided historical context. "
            "Analyze the fault description below. Heavily weigh the 'Historical Context from Pinecone' to inform your diagnosis. If the context is empty, rely on your general expertise. "
            "Your response MUST be a single, minified JSON object with the exact keys specified. Do not include any text outside the JSON object.\n\n"
            "JSON Structure Required:\n"
            "{\n"
            "  \"diagnosis\": \"string\",\n"
            "  \"reasoning\": \"string explaining how the historical context or general knowledge led to the diagnosis\",\n"
            "  \"confidence_score\": \"string: High, Medium, or Low\",\n"
            "  \"root_causes\": [{\"cause\": \"string\", \"probability\": \"string: High, Medium, Low\"}],\n"
            "  \"resolution_plan\": [\"string (step-by-step actions)\"],\n"
            "  \"preventative_actions\": [\"string\"],\n"
            "  \"disclaimer\": \"string\"\n"
            "}\n\n"
            f"--- Fault Description ---\n{fault_input}\n\n"
            f"--- Historical Context from Pinecone ---\n{context}"
        )


        print("Step 3: Sending enhanced prompt v2 to OpenAI for generation...")
        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            max_tokens=700, # Increased tokens for a more detailed response
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        json_string = ai_response.choices[0].message.content
        diagnosis_data = json.loads(json_string)
        print("Step 3: OpenAI generation successful. Received valid JSON.")

        # Add our own metadata to the response object
        diagnosis_data['similar_faults_context'] = context if "No similar" not in context else ""
        diagnosis_data['status'] = "AI-powered response with Pinecone similarity search"

        return diagnosis_data

    except Exception as e:
        print(f"!!! AN ERROR OCCURRED: {e} !!!")
        return {
            "error": "An exception occurred during the AI query.",
            "details": str(e)
        }

