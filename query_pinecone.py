from dotenv import load_dotenv
import os

# Load environment variables once with explicit path
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
print("Loaded env - PINECONE_API_KEY:", bool(os.getenv("PINECONE_API_KEY")))  # Debug print

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from safe_ai_query import query_fault_description_safe
import logging  # Add for better logging

app = Flask(__name__)

# Enable CORS for multiple origins (FlutterFlow preview, production frontend, etc.)
CORS(app, origins=[
  "https://www.vectorscan.io",  # Old frontend
  "https://app.flutterflow.io",  # FlutterFlow preview domain (adjust if specific project URL)
  "https://your-flutter-app-domain.com"  # Add your final deployed domain later
], supports_credentials=True, methods=["GET", "POST", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
if not app.config['JWT_SECRET_KEY']:
    raise ValueError("JWT_SECRET_KEY not set in .env")

jwt = JWTManager(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock user database (replace with PostgreSQL for production)
users = {
    'engineer_iona': {'password': 'pass123', 'role': 'ETO_Iona', 'ship': 'Iona'},
    'engineer_wonder': {'password': 'pass456', 'role': 'ETO_Wonder', 'ship': 'Wonder of the Seas'},
    'engineer_wind': {'password': 'pass789', 'role': 'ETO_WindSurf', 'ship': 'Wind Surf'},
    'admin': {'password': 'admin123', 'role': 'Admin', 'ship': 'All'}
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'VectorScan API'}), 200

@app.route('/login', methods=['POST'])
def login():
    """Authentication endpoint"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username').strip() if data.get('username') else None
        password = data.get('password').strip() if data.get('password') else None
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        if username in users and users[username]['password'] == password:
            access_token = create_access_token(
                identity={
                    'username': username,
                    'role': users[username]['role'],
                    'ship': users[username]['ship']
                }
            )
            logger.info(f"Successful login for {username}")
            return jsonify({
                'token': access_token,
                'user': {
                    'username': username,
                    'role': users[username]['role'],
                    'ship': users[username]['ship']
                }
            }), 200
        
        logger.warning(f"Invalid login attempt for {username}")
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': f'Login error: {str(e)}'}), 500

@app.route('/query', methods=['POST'])
@jwt_required()
def query_fault():
    """Fault diagnosis query endpoint"""
    try:
        current_user = get_jwt_identity()
        ship = current_user['ship']
        
        data = request.json
        logger.info("Received query data: %s", data)
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        fault_input = data.get('fault_description', '').strip()
        if not fault_input:
            return jsonify({'error': 'Fault input required'}), 400
        
        # Use AI-powered Pinecone query for real maritime fault diagnosis
        result = query_fault_description_safe(fault_input, ship_filter=ship)
        
        return jsonify({
            'result': result,
            'fault_description': fault_input,
            'ship': ship,
            'user': current_user['username']
        }), 200
        
    except Exception as e:
        logger.error(f"Query error: {str(e)}")
        # Fallback response if AI service is unavailable
        try:
            current_user = get_jwt_identity()
        except:
            current_user = {'username': 'Unknown', 'ship': 'Unknown'}
        ship = current_user.get('ship', 'Unknown')
        fault_input = data.get('fault_description', 'Unknown fault') if data else 'Unknown fault'
        
        fallback_result = f"AI service temporarily unavailable. Fault logged: {fault_input} on {ship}. Please contact technical support."
        return jsonify({
            'result': fallback_result,
            'error': str(e),
            'fallback': True
        }), 200

@app.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    """Get current user information"""
    current_user = get_jwt_identity()
    return jsonify({'user': current_user}), 200

@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {str(error)}")
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG', False), host='0.0.0.0', port=5000)  # Use env for debug in prod