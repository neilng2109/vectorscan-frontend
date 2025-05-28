import os
from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

# Initialize Pinecone and OpenAI
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("vectorscan-faults")
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def query_fault_description(fault_input):
    # Step 1: Embed the input fault description using the new OpenAI API
    embedding_response = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=fault_input
    )
    fault_embedding = embedding_response.data[0].embedding

    # Step 2: Query Pinecone for similar faults
    query_response = index.query(
        vector=fault_embedding,
        top_k=3,
        include_metadata=True
    )
    print("Pinecone Query Response:", query_response)  # Debug: Log the full query response

    # Step 3: Extract relevant information from the matches
    matches = query_response['matches']
    if not matches:
        return "No similar faults found in the database."

    # Debug: Print the metadata to inspect its structure
    primary_match = matches[0]['metadata']
    print("Primary Match Metadata:", primary_match)

    # Access metadata fields
    equipment = primary_match.get('equipment_affected', 'Unknown Equipment')
    diagnosis = primary_match.get('diagnosis', f"{equipment} issue detected")
    likely_causes = primary_match.get('cause', 'Cause not identified')
    symptoms = primary_match.get('symptoms_observed', 'Symptoms not specified')

    past_faults = [
        {
            "equipment": match['metadata'].get('equipment_affected', 'Unknown Equipment'),
            "fault": match['metadata'].get('fault_description', 'Unknown Fault'),
            "resolution": match['metadata'].get('resolution_action', 'Not resolved'),
            "id": match['id'],
            "date": match['metadata'].get('date_of_fault', 'Unknown')
        }
        for match in matches
    ]

    # Step 4: Use OpenAI to generate recommended actions using the new API
    past_faults_text = "\n".join([
        f"Equipment: {f['equipment']}, Fault: {f['fault']}, Symptoms: {match['metadata'].get('symptoms_observed', 'N/A')}, Cause: {match['metadata'].get('cause', 'N/A')}, Resolution: {f['resolution']}"
        for f, match in zip(past_faults, matches)
    ])
    prompt = f"""
    You are a shipboard diagnostic assistant for a 130,000-ton cruise ship. Based on the following historical fault data, provide exactly three recommended actions for the fault: "{fault_input}".

    Equipment: {equipment}
    Diagnosis: {diagnosis}
    Symptoms Observed: {symptoms}
    Likely Causes: {likely_causes}
    Historical Faults:
    {past_faults_text}

    Provide exactly 3 recommended actions, marking urgent ones with [!]. Ensure the actions are practical and specific for a cruise ship environment. Format each action as a bullet point starting with '-'.
    """
    openai_response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a shipboard diagnostic assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )
    recommended_actions = openai_response.choices[0].message.content.strip().split('\n')
    # Ensure we have exactly 3 actions
    while len(recommended_actions) < 3:
        recommended_actions.append("- Review maintenance logs for additional insights")

    # Step 5: Format the response
    past_faults_table = "\n".join([
        f"| {f['equipment']:<20} | {f['fault']:<25} | {f['resolution']:<30} | {f['date']:<15} | {f['id']:<5} |"
        for f in past_faults
    ])
    response = f"""
{fault_input.title()} - Fault Diagnosis Report
-----------------------------------------------
Diagnosis: {diagnosis}
Symptoms Observed: {symptoms}
Likely Causes: {likely_causes}
Recommended Actions:
{recommended_actions[0]}
{recommended_actions[1]}
{recommended_actions[2]}
Similar Past Faults:
| Equipment            | Fault                     | Resolution                     | Date            | ID    |
|----------------------|---------------------------|--------------------------------|-----------------|-------|
{past_faults_table}
    """
    return response

if __name__ == "__main__":
    import sys
    fault_input = sys.argv[1] if len(sys.argv) > 1 else "cooling pump overheating"
    print(f"Input: {fault_input}")
    print("Result:", query_fault_description(fault_input))