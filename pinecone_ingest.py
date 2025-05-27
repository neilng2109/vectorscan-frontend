import os
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from tqdm import tqdm
from pinecone import Pinecone, ServerlessSpec

print("Script starting...")

# Load environment variables
print("Loading environment variables...")
load_dotenv()
print("Environment variables loaded.")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ENVIRONMENT = "us-east-1"
INDEX_NAME = "vectorscan-faults"

print(f"PINECONE_API_KEY (first 5 chars): {PINECONE_API_KEY[:5] if PINECONE_API_KEY else 'None'}")
print(f"OPENAI_API_KEY (first 5 chars): {OPENAI_API_KEY[:5] if OPENAI_API_KEY else 'None'}")

if not PINECONE_API_KEY or not OPENAI_API_KEY:
    print("Error: API keys not found. Check your .env file.")
    exit(1)
print("API keys validated.")

# Initialize Pinecone
print("Initializing Pinecone...")
try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    print("Pinecone initialized successfully.")
except Exception as e:
    print(f"Error initializing Pinecone: {e}")
    exit(1)

# Access or Create the Index
print(f"Checking for index: {INDEX_NAME}...")
if INDEX_NAME not in pc.list_indexes().names():
    print(f"Index {INDEX_NAME} not found, creating...")
    try:
        pc.create_index(
            name=INDEX_NAME,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region=ENVIRONMENT)
        )
        print(f"Index {INDEX_NAME} created.")
    except Exception as e:
        print(f"Error creating index: {e}")
        exit(1)
else:
    print(f"Index {INDEX_NAME} already exists.")

index = pc.Index(INDEX_NAME)
print(f"Index {INDEX_NAME} accessed.")

# Initialize OpenAI with modern client
print("Initializing OpenAI client...")
try:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    print("OpenAI client initialized successfully.")
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")
    exit(1)

def generate_embedding(text):
    print(f"Generating embedding for text: {text[:50]}...")
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=[text]
        )
        embedding = response.data[0].embedding
        print(f"Embedding generated successfully (length: {len(embedding)}).")
        return embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def ingest_data(file_path):
    print(f"Attempting to load data from {file_path}...")
    try:
        data = pd.read_csv(file_path)
        print(f"Loaded {len(data)} records from {file_path}")
        print("Columns in CSV:", list(data.columns))

        # Validate expected columns
        expected_columns = ["Fault Entry ID", "Equipment Affected", "Fault Description", "Cause (if known)", "Resolution Action"]
        missing_columns = [col for col in expected_columns if col not in data.columns]
        if missing_columns:
            print(f"Error: Missing columns in CSV: {missing_columns}")
            return

        vectors = []
        for idx, row in tqdm(data.iterrows(), total=data.shape[0]):
            record_id = str(row["Fault Entry ID"])
            equipment = str(row.get("Equipment Affected", "Unknown"))
            fault_desc = str(row.get("Fault Description", "Unknown"))
            cause = str(row.get("Cause (if known)", "Unknown"))
            resolution = str(row.get("Resolution Action", "Unknown"))

            combined_text = f"{equipment} - {fault_desc} - {cause} - {resolution}"
            embedding = generate_embedding(combined_text)

            if embedding:
                metadata = {
                    "equipment": equipment,
                    "fault": fault_desc,
                    "cause": cause,
                    "resolution": resolution,
                    "text": combined_text
                }
                vectors.append((record_id, embedding, metadata))
                print(f"Prepared vector for record {record_id} with metadata: {metadata}")

        if vectors:
            print(f"Upserting {len(vectors)} vectors to Pinecone...")
            index.upsert(vectors=vectors)
            print(f"Successfully upserted {len(vectors)} vectors into {INDEX_NAME}.")
            
            # Verify metadata storage by fetching multiple records
            test_ids = [vector[0] for vector in vectors[:3]]  # First 3 IDs
            print(f"Verifying metadata for records: {test_ids}...")
            fetch_response = index.fetch(ids=test_ids)
            print(f"Fetch response: {fetch_response}")
            for test_id in test_ids:
                if fetch_response.vectors and test_id in fetch_response.vectors:
                    vector_data = fetch_response.vectors[test_id]
                    metadata = getattr(vector_data, 'metadata', None)
                    print(f"Metadata for {test_id}: {metadata}")
                else:
                    print(f"No metadata found for {test_id} in fetch response.")
        else:
            print("No vectors generated to upsert.")

    except Exception as e:
        print(f"Error during data ingestion: {e}")

if __name__ == "__main__":
    csv_path = "C:/Users/neilg/vectorscan/venv/fault_data.csv"
    ingest_data(csv_path)
    print("Script finished.")