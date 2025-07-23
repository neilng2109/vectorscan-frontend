import os
from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()  # Load from .env file if it exists, otherwise use system env vars
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Fallback for development if API keys are not found
if not PINECONE_API_KEY or not OPENAI_API_KEY:
    print("Warning: API keys not found in environment variables")

# Initialize Pinecone and OpenAI
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index("vectorscan-faults")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def generate_embedding(text):
    response = openai_client.embeddings.create(input=text, model="text-embedding-ada-002")
    return response.data[0].embedding

def query_fault_description(fault_input, ship_filter=None):
    try:
        # Normalize fault input for better matching
        fault_input_normalized = " ".join(sorted(fault_input.lower().strip().split()))
        # Extract equipment from fault input (simplified heuristic)
        equipment = "Main Engine" if "engine" in fault_input_normalized else "Cooling Pump" if "pump" in fault_input_normalized else "Unknown"
        # Default diagnosis for common faults
        default_diagnoses = {
            "engine main overheat": (
                "**Diagnosis:** Main engine overheat detected.\n"
                "**Cause:** Likely coolant flow issue or thermostat failure.\n"
                "**Resolution:** Inspect coolant system, clear blockages, replace thermostat."
            ),
            "cooling high pump temperature": (
                "**Diagnosis:** Cooling pump high temperature detected.\n"
                "**Cause:** Likely clogged filter or impeller damage.\n"
                "**Resolution:** Inspect and clean filter, check impeller, ensure flow."
            ),
            "cooling overheating pump": (
                "**Diagnosis:** Cooling pump overheating detected.\n"
                "**Cause:** Likely clogged filter or impeller damage.\n"
                "**Resolution:** Inspect and clean filter, check impeller, ensure flow."
            )
        }
        default_response = default_diagnoses.get(fault_input_normalized, None)
        
        # Generate embedding
        fault_embedding = generate_embedding(fault_input)  # Use raw input for embedding
        # Query Pinecone with optional ship filter
        query_params = {
            "vector": fault_embedding,
            "top_k": 5,  # Top 5 similar faults
            "include_metadata": True,
            "filter": {"equipment": {"$eq": equipment}} if equipment != "Unknown" else {}
        }
        if ship_filter and ship_filter.lower() != "all":
            query_params["filter"]["ship"] = {"$eq": ship_filter}  # Add ship filter if provided

        results = index.query(**query_params)
        print(f"Debug: Pinecone matches found: {len(results['matches'])}")  # Debug print
        
        # Debug: Print all matches
        for match in results["matches"]:
            metadata = match["metadata"]
            print(f"Debug: Metadata: {metadata}")

        # Select the most relevant past fault (if it matches the input fault type)
        context = []
        previous_faults = []
        for match in results["matches"][:1]:  # Limit to top 1
            metadata = match["metadata"]
            fault_entry = f"Fault: {metadata.get('fault', 'Unknown')}, Equipment: {metadata.get('equipment', 'Unknown')}, Cause: {metadata.get('cause', 'Unknown')}, Resolution: {metadata.get('resolution', 'Not specified')}"
            print(f"Debug: Match: {fault_entry}")
            # Check if the fault description and cause are relevant (e.g., contains "overheat" and a plausible cause)
            fault_desc = metadata.get('fault', '').lower()
            cause = metadata.get('cause', '').lower()
            if ("overheat" in fault_desc and "overheat" in fault_input_normalized and 
                any(keyword in cause for keyword in ["coolant", "thermostat", "flow", "pump", "filter", "impeller"])):
                context.append(fault_entry)
                previous_faults.append(fault_entry)
        context_str = "\n".join(context)
        
        # Generate diagnosis if no default response
        if not default_response:
            prompt = (
                f"You are a maritime fault diagnosis expert. "
                f"Fault: '{fault_input}'.\n"
                f"Equipment: {equipment if equipment != 'Unknown' else 'Not specified'}.\n"
                f"Context of most similar past fault: {context_str if context_str else 'No similar faults found.'}\n"
                "Provide a concise diagnosis, cause, and resolution in 20–30 words, focusing on the input fault. Use the past fault as context only if its cause is directly relevant (e.g., coolant-related for overheating). Otherwise, provide a general diagnosis. Format as: **Diagnosis:** [text]\n**Cause:** [text]\n**Resolution:** [text]"
            )
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50
            )
            diagnosis = response.choices[0].message.content.strip()
        else:
            diagnosis = default_response
        
        # Combine diagnosis with previous fault
        if previous_faults:
            previous_faults_str = "\n\n**Similar Past Fault:**\n" + "\n".join(previous_faults)
            return f"{diagnosis}{previous_faults_str}"
        return diagnosis
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    # Interactive input
    fault_input = input("Enter fault description (e.g., Main Engine Overheat): ")
    result = query_fault_description(fault_input)
    print(f"Input: {fault_input}")
    print(f"Result: {result}")