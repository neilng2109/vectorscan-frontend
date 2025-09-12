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
    Performs a full RAG query and returns a rich, structured JSON object.
    """
    if not PINECONE_API_KEY or not OPENAI_API_KEY:
        return {"error": "API keys not configured."}

    try:
        # Step 1: Create embedding
        response = openai_client.embeddings.create(input=fault_input, model="text-embedding-ada-002")
        fault_embedding = response.data[0].embedding

        # Step 2: Query Pinecone
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
                context += f"- Fault: {metadata.get('fault', 'N/A')}, Cause: {metadata.get('cause', 'N/A')}\n"
        else:
            context = "No similar historical faults were found."
        
        # --- ENHANCED PROMPT ---
        prompt = (
            "You are a Chief Marine Engineer. Your response MUST be a single, minified JSON object with the exact keys specified: "
            "'diagnosis' (string), "
            "'reasoning' (string explaining your logic), "
            "'confidence_score' (string: 'High', 'Medium', or 'Low'), "
            "'root_causes' (array of objects with 'cause' and 'probability'), "
            "'resolution_plan' (array of strings), "
            "'preventative_actions' (array of strings), "
            "'disclaimer' (string).\n\n"
            f"Fault: {fault_input}\n\n"
            f"Context: {context}"
        )

        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            max_tokens=700,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        json_string = ai_response.choices[0].message.content
        diagnosis_data = json.loads(json_string)

        diagnosis_data['similar_faults_context'] = context if "No similar" not in context else ""
        diagnosis_data['status'] = "AI-powered response with Pinecone similarity search"

        return diagnosis_data

    except Exception as e:
        return {
            "error": "An exception occurred during the AI query.",
            "details": str(e)
        }

