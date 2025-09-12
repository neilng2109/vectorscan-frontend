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
            context = "No similar historical faults found in the database."
        
        # --- ENHANCED PROMPT ENGINEERING ---
        prompt = (
            "You are a Chief Marine Engineer with 20 years of experience on large commercial vessels. "
            "Analyze the following fault based on your expertise and the provided historical context. "
            "Provide a detailed, structured response in a single, minified JSON object. Do not include any text or formatting outside of the JSON object. "
            "The JSON object must contain the following keys: "
            "'diagnosis' (string), "
            "'confidence_score' (string: 'High', 'Medium', or 'Low'), "
            "'root_causes' (an array of objects, each with 'cause' [string] and 'probability' [string: 'High', 'Medium', 'Low']), "
            "'resolution_plan' (an array of strings representing step-by-step actions), "
            "'preventative_actions' (an array of strings), "
            "'disclaimer' (string: 'This is an AI-generated diagnosis and should be used as a reference. Always follow vessel-specific safety protocols and consult official manuals.').\n\n"
            f"--- Fault Description ---\n{fault_input}\n\n"
            f"--- Historical Context ---\n{context}"
        )

        print("Step 3: Sending enhanced prompt to OpenAI for generation...")
        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            max_tokens=500, # Increased tokens for a more detailed response
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

