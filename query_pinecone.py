import os
import logging
from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI
from spellchecker import SpellChecker

# Setup logging to file
logging.basicConfig(filename="query_pinecone.log", level=logging.DEBUG, format="%(asctime)s - %(message)s")

load_dotenv("C:/Users/neilg/vectorscan/venv/.env")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize Pinecone and OpenAI
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index("vectorscan-faults")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Initialize spell checker
spell = SpellChecker()

def correct_typos(text):
    words = text.split()
    corrected = [spell.correction(word) if spell.correction(word) else word for word in words]
    return " ".join(corrected)

def generate_embedding(text):
    response = openai_client.embeddings.create(input=text, model="text-embedding-ada-002")
    return response.data[0].embedding

def query_fault_description(fault_input):
    try:
        # Correct typos and preprocess
        fault_input_normalized = correct_typos(fault_input.strip())
        logging.debug(f"Normalized input: {fault_input_normalized}")
        
        # Extract equipment with improved heuristic
        fault_lower = fault_input_normalized.lower()
        equipment = (
            "Steering Gear Pump" if "steering" in fault_lower
            else "Cooling Pump #1" if "pump" in fault_lower and "cooling" in fault_lower
            else "HVAC System" if "hvac" in fault_lower
            else "Emergency Generator" if "generator" in fault_lower
            else "Main Engine" if "engine" in fault_lower
            else "Unknown"
        )
        equipment_filter = {
            "Steering Gear Pump": ["Steering Gear Pump"],
            "Cooling Pump #1": ["Cooling Pump #1", "Cooling Pump #2"],
            "HVAC System": ["HVAC System"],
            "Emergency Generator": ["Emergency Generator"],
            "Main Engine": ["Main Engine"]
        }.get(equipment, [equipment])
        
        # Generate embedding
        fault_embedding = generate_embedding(fault_input_normalized)
        
        # Query Pinecone with strict equipment filter
        query_params = {
            "vector": fault_embedding,
            "top_k": 10,
            "include_metadata": True,
            "filter": {"equipment": {"$in": equipment_filter}} if equipment != "Unknown" else {}
        }
        
        results = index.query(**query_params, namespace="")
        logging.debug(f"Pinecone matches found: {len(results['matches'])}")
        for match in results["matches"]:
            logging.debug(f"ID: {match['id']}, Score: {match['score']}, Metadata: {match['metadata']}")
        
        # Build context for diagnosis, ensuring equipment matches
        context = []
        past_faults = [
            "| Equipment | Fault | Resolution | ID |",
            "|-----------|-------|------------|----|"
        ]
        for match in results["matches"][:2]:
            metadata = match["metadata"]
            # Only include matches that strictly match the equipment
            if metadata.get('equipment') in equipment_filter:
                fault_entry = f"Fault: {metadata.get('fault', 'Unknown')}, Equipment: {metadata.get('equipment', 'Unknown')}, Cause: {metadata.get('cause', 'Unknown')}, Resolution: {metadata.get('resolution', 'Not specified')}"
                context.append(fault_entry)
                fault_name = metadata.get('fault', 'Unknown').split(" - ")[0]
                cause = metadata.get('cause', 'Unknown').split(" due to ")[0].capitalize()
                resolution = metadata.get('resolution', 'Not specified').split(".")[0].capitalize()
                past_faults.append(
                    f"| {metadata.get('equipment', 'Unknown')} | {fault_name} | {cause}; {resolution} | {match['id']} |"
                )
        context_str = "\n".join(context) if context else "No similar faults found for the specified equipment."
        
        # Generate diagnosis with consistent formatting
        prompt = (
            f"You are a maritime fault diagnosis expert. "
            f"Fault: '{fault_input_normalized}'.\n"
            f"Equipment: {equipment}.\n"
            f"Context: {context_str}\n"
            "Provide a one-line diagnosis, causes, and actions in 50 words or less, focusing strictly on the specified equipment ({equipment}). For HVAC faults, ensure the diagnosis refers to the HVAC System (heating, ventilation, air conditioning system), not a vacuum system. Base the recommended actions on the historical resolutions (context) and the likely causes of the current fault. Avoid specific tool references (e.g., Fluke 87V multimeter) unless they are part of the historical resolutions. Tag actions involving inspection or immediate safety checks with '[!]' at the start of the line (e.g., - [!] Check fuse). List each action on a new line starting with '-'. "
            "Format as: **Diagnosis:** [text]\n**Likely Causes:** [text]\n**Recommended Actions:**\n- [action]\n- [action]"
        )
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        diagnosis = response.choices[0].message.content.strip()
        
        # Format output as a report with minimal separators
        report = f"{fault_input_normalized.title()} - Fault Diagnosis Report\n{'-' * 47}\n"
        # Clean whitespace and ensure proper formatting
        report += diagnosis.replace("**Diagnosis:**", "Diagnosis:").replace("**Likely Causes:**", "Likely Causes:").replace(
            "**Recommended Actions:**", "Recommended Actions:"
        ).replace("  \n", "\n").replace(" - ", "\n  - ")
        if past_faults:
            report += "\nSimilar Past Faults:\n" + "\n".join(past_faults)
        
        return report
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    fault_input = input("Enter fault description (e.g., Main Engine Overheat): ")
    result = query_fault_description(fault_input)
    print(f"Input: {fault_input}")
    print(f"Result: {result}")