import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def query_fault_description_safe(fault_input, ship_filter=None):
    """
    Safe version of fault diagnosis that handles missing API keys gracefully
    """
    try:
        # Check if API keys are available
        if not PINECONE_API_KEY or not OPENAI_API_KEY or PINECONE_API_KEY == "your-pinecone-api-key-here" or OPENAI_API_KEY == "your-openai-api-key-here":
            print("Using mock diagnosis - API keys not configured")
            return generate_mock_diagnosis(fault_input, ship_filter)
        
        print(f"Using AI-powered diagnosis for: {fault_input}")
        
        # Try to import and use the full AI functionality
        from pinecone import Pinecone
        from openai import OpenAI
        
        # Initialize clients
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index("vectorscan-faults")
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Generate embedding
        response = openai_client.embeddings.create(input=fault_input, model="text-embedding-ada-002")
        fault_embedding = response.data[0].embedding
        
        # Query Pinecone
        results = index.query(
            vector=fault_embedding,
            top_k=3,
            include_metadata=True
        )
        
        print(f"Pinecone returned {len(results['matches'])} matches")
        
        # Generate AI diagnosis
        context = ""
        if results['matches']:
            for match in results['matches'][:2]:
                metadata = match.get('metadata', {})
                context += f"Similar fault: {metadata.get('fault', 'Unknown')} - {metadata.get('cause', 'Unknown cause')}\n"
        
        prompt = f"""You are a maritime fault diagnosis expert. 
        Fault: '{fault_input}'
        Ship Filter: {ship_filter or 'All'}
        
        Similar past faults:
        {context}
        
        Provide a concise diagnosis with cause and resolution in 50 words or less.
        Format as: **Diagnosis:** [text]
        **Cause:** [text]
        **Resolution:** [text]"""
        
        ai_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        
        diagnosis = ai_response.choices[0].message.content.strip()
        
        if context:
            diagnosis += f"\n\n**Similar Past Faults:**\n{context}"
        
        diagnosis += "\n\n**Status:** AI-powered response with Pinecone similarity search"
        
        return diagnosis
        
    except Exception as e:
        print(f"AI diagnosis failed: {str(e)}")
        # If AI fails, return enhanced mock response with error info
        return generate_mock_diagnosis(fault_input, ship_filter, error=str(e))

def generate_mock_diagnosis(fault_input, ship_filter=None, error=None):
    """
    Generate enhanced mock diagnosis response
    """
    # Enhanced mock responses based on fault type
    fault_lower = fault_input.lower()
    
    if "engine" in fault_lower and "overheat" in fault_lower:
        diagnosis = """**Diagnosis:** Main engine overheating detected.
**Cause:** Likely coolant system malfunction or thermostat failure.
**Resolution:** Check coolant levels, inspect thermostat, clear any blockages in cooling system."""
    
    elif "pump" in fault_lower and ("temperature" in fault_lower or "overheat" in fault_lower):
        diagnosis = """**Diagnosis:** Cooling pump high temperature detected.
**Cause:** Possible impeller damage or clogged filter restricting flow.
**Resolution:** Inspect pump impeller, clean/replace filter, check for proper flow rates."""
    
    elif "cooling" in fault_lower:
        diagnosis = """**Diagnosis:** Cooling system fault identified.
**Cause:** System component failure or flow restriction.
**Resolution:** Inspect cooling circuit, check pumps, valves, and heat exchangers."""
    
    else:
        diagnosis = f"""**Diagnosis:** {fault_input} requires investigation.
**Cause:** Equipment malfunction or operational parameter deviation.
**Resolution:** Conduct systematic inspection of affected system components."""
    
    # Add ship filter info
    if ship_filter and ship_filter != "All":
        diagnosis += f"\n\n**Ship:** {ship_filter}"
    
    # Add status info
    if error:
        diagnosis += f"\n\n**Status:** Mock response (AI temporarily unavailable: {error[:50]}...)"
    elif not PINECONE_API_KEY or PINECONE_API_KEY == "your-pinecone-api-key-here":
        diagnosis += "\n\n**Status:** Mock response (API keys not configured)"
    else:
        diagnosis += "\n\n**Status:** Mock response (AI integration ready for testing)"
    
    return diagnosis
