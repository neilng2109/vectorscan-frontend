from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import os
from query_pinecone import query_fault_description

app = Flask(__name__, template_folder='templates')

# Enhanced CORS configuration
CORS(app, origins="*", supports_credentials=False, methods=['GET', 'POST', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'])

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secure-vectorscan-jwt-key-2024')
jwt = JWTManager(app)

# Mock user database
users = {
    'engineer_iona': {'password': 'pass123', 'role': 'ETO_Iona', 'ship': 'Iona'},
    'engineer_wonder': {'password': 'pass456', 'role': 'ETO_Wonder', 'ship': 'Wonder of the Seas'},
    'engineer_wind': {'password': 'pass789', 'role': 'ETO_WindSurf', 'ship': 'Wind Surf'},
    'admin': {'password': 'admin123', 'role': 'Admin', 'ship': 'All'}
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "VectorScan API is working!"})

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        if username in users and users[username]['password'] == password:
            access_token = create_access_token(
                identity=username,
                additional_claims={
                    'role': users[username]['role'], 
                    'ship': users[username]['ship']
                }
            )
            return jsonify({
                'token': access_token,
                'user': {
                    'username': username,
                    'role': users[username]['role'],
                    'ship': users[username]['ship']
                }
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': f'Login error: {str(e)}'}), 500

@app.route('/query', methods=['GET', 'POST'])
@jwt_required()
def query():
    try:
        current_user = get_jwt_identity()  # This is the username
        claims = get_jwt()  # This gets the additional claims
        ship = claims.get('ship', 'All')
        
        if request.method == 'POST':
            print(f"DEBUG: POST request received")
            
            data = request.json
            if not data:
                print("ERROR: No JSON data received")
                return jsonify({'error': 'No JSON data provided'}), 400
                
            print(f"DEBUG: Received data: {data}")
            
            # Try both parameter names for compatibility
            fault_input = data.get('fault_input', '') or data.get('fault_description', '')
            fault_input = fault_input.strip()
            
            print(f"DEBUG: Extracted fault_input: '{fault_input}'")
            
            if not fault_input:
                print("ERROR: Empty fault_input")
                return jsonify({'error': 'Fault description required'}), 400
                
            print(f"DEBUG: Processing fault for ship: {ship}")
            
            # Use AI-powered Pinecone query
            print(f"DEBUG: Calling query_fault_description with: '{fault_input}', ship_filter='{ship}'")
            result = query_fault_description(fault_input, ship_filter=ship)
            print(f"DEBUG: Got result: {result[:100]}...")
            
            return jsonify({'result': result})
        
        # GET request - return the template
        return render_template('query.html')
        
    except Exception as e:
        print(f"ERROR: Exception in query endpoint: {str(e)}")
        # Fallback response
        fault_input = request.json.get('fault_input', 'Unknown fault') if request.json else 'Unknown fault'
        ship = 'Unknown'
        fallback_result = f"AI service temporarily unavailable. Fault logged: {fault_input} on {ship}. Please contact technical support."
        return jsonify({'result': fallback_result, 'error': str(e)}), 200

if __name__ == '__main__':
    print("Starting VectorScan API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
