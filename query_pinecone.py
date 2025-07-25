from pinecone import Pinecone
import os
from openai import OpenAI

def query_fault_description(fault_input, ship_filter=None):
    try:
        # Initialize Pinecone with latest API (no project_name or environment)
        pc = Pinecone(api_key=os.environ.get('PINECONE_API_KEY'))
        
        index = pc.Index('vectorscan-faults')
        
        # Initialize OpenAI
        openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        
        # Generate embedding for fault_input using OpenAI
        embedding_response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=fault_input
        )
        embedding = embedding_response.data[0].embedding
        
        # Query Pinecone
        query_params = {'vector': embedding, 'top_k': 5}
        if ship_filter and ship_filter != 'All':
            query_params['filter'] = {'ship': ship_filter}
        
        results = index.query(**query_params)
        
        # Process results with OpenAI for diagnosis
        context = "\n".join([match['metadata']['description'] for match in results['matches'] if 'metadata' in match and 'description' in match['metadata']])
        
        prompt = f"Based on similar faults: {context}\nDiagnose: {fault_input}"
        
        completion = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        diagnosis = completion.choices[0].message.content
        
        return {
            'diagnosis': diagnosis,
            'similar_faults': results['matches']
        }
        
    except Exception as e:
        raise Exception(f"Query error: {str(e)}")  # Raise to trigger fallback in app.py