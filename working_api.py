from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import os
from safe_ai_query import query_fault_description_safe

app = Flask(__name__)

# Enable CORS for all origins to fix login issue immediately
CORS(app, origins="*", supports_credentials=False)

# JWT configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secure-vectorscan-jwt-key-2024')
jwt = JWTManager(app)

# Mock user database
users = {
    'admin': {'password': 'admin123', 'role': 'Admin', 'ship': 'All'},
    'engineer_iona': {'password': 'pass123', 'role': 'ETO_Iona', 'ship': 'Iona'},
    'engineer_wonder': {'password': 'pass456', 'role': 'ETO_Wonder', 'ship': 'Wonder of the Seas'}
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "VectorScan API is working!"})

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if username in users and users[username]['password'] == password:
            # Create access token
            access_token = create_access_token(
                identity={
                    'username': username, 
                    'role': users[username]['role'], 
                    'ship': users[username]['ship']
                }
            )
            
            response = jsonify({
                "success": True,
                "token": access_token,
                "message": "Login successful",
                "user": {
                    "username": username,
                    "role": users[username]['role'],
                    "ship": users[username]['ship']
                }
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({
                "success": False,
                "message": "Invalid credentials"
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 401
            
    except Exception as e:
        response = jsonify({
            "success": False,
            "message": f"Login error: {str(e)}"
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/query', methods=['POST', 'OPTIONS'])
@jwt_required()
def query():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    try:
        data = request.get_json()
        fault_description = data.get('fault_description', '')
        ship_filter = data.get('ship_filter', 'All')
        
        # Use safe AI integration that handles missing API keys gracefully
        diagnosis = query_fault_description_safe(fault_description, ship_filter)
        
        response_data = {
            "result": diagnosis
        }
        
        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        response = jsonify({
            "error": f"Query error: {str(e)}"
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
