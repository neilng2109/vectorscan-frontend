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
        # Always use mock diagnosis for now to ensure stability
        return generate_mock_diagnosis(fault_input, ship_filter)
        
    except Exception as e:
        # Fallback to basic response if even mock fails
        return f"**Diagnosis:** {fault_input or 'Unknown fault'} requires investigation.\n**Cause:** System analysis pending.\n**Resolution:** Contact maintenance team for inspection.\n\n**Status:** Error handled safely: {str(e)[:50]}"

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
