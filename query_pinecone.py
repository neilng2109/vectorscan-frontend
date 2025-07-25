from pinecone import Pinecone
import os
from openai import OpenAI

def query_fault_description(fault_input, ship_filter=None):
    try:
        # Initialize Pinecone (no 'proxies' - deprecated; use env if needed)
        pc = Pinecone(
            api_key=os.environ.get('PINECONE_API_KEY')
        )
        print("Pinecone initialized")  # Debug
        
        index = pc.Index('vectorscan-faults')
        
        # Initialize OpenAI
        openai_client = OpenAI(
            api_key=os.environ.get('OPENAI_API_KEY')
        )
        print("OpenAI initialized")  # Debug
        
        # Generate embedding
        embedding_response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=fault_input
        )
        embedding = embedding_response.data[0].embedding
        print("Embedding generated")  # Debug
        
        # Query Pinecone
        query_params = {
            'vector': embedding,
            'top_k': 5
        }
        if ship_filter and ship_filter != 'All':
            query_params['filter'] = {'ship': ship_filter}
        
        results = index.query(**query_params)
        print("Pinecone query successful")  # Debug
        
        # Process with OpenAI
        context = "\n".join([
            match['metadata'].get('description', '') 
            for match in results['matches'] 
            if 'metadata' in match
        ])
        
        prompt = f"Based on similar faults: {context}\nDiagnose: {fault_input}\nProvide diagnosis, cause, resolution."
        
        completion = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        diagnosis = completion.choices[0].message.content
        print("OpenAI completion successful")  # Debug
        
        return {
            'diagnosis': diagnosis,
            'similar_faults': results['matches']
        }
        
    except Exception as e:
        print(f"Query error: {str(e)}")  # Debug
        raise Exception(f"Query error: {str(e)}")  # Trigger fallback