from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from query_pinecone import query_fault_description
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React UI
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secure-key')  # Set in Heroku env
jwt = JWTManager(app)

# Mock user database (replace with PostgreSQL for production)
users = {
    'engineer_iona': {'password': 'pass123', 'role': 'ETO_Iona', 'ship': 'Iona'},
    'engineer_wonder': {'password': 'pass456', 'role': 'ETO_Wonder', 'ship': 'Wonder of the Seas'},
    'engineer_wind': {'password': 'pass789', 'role': 'ETO_WindSurf', 'ship': 'Wind Surf'},
    'admin': {'password': 'admin123', 'role': 'Admin', 'ship': 'All'}
}

@app.route('/')
def home():
    return jsonify({'message': 'VectorScan API is running. Use POST /query to diagnose faults.'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username in users and users[username]['password'] == password:
        access_token = create_access_token(identity={'username': username, 'role': users[username]['role'], 'ship': users[username]['ship']})
        return jsonify(token=access_token), 200
    return jsonify(error='Invalid credentials'), 401

@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    ship = current_user['ship']
    return jsonify(message=f'Welcome to VectorScan Dashboard for {ship}')

@app.route('/query', methods=['POST'])
@jwt_required()
def query():
    current_user = get_jwt_identity()
    ship = current_user['ship']
    data = request.json
    fault_input = data.get('fault_input', '')
    if not fault_input:
        return jsonify({'error': 'Fault description required'}), 400
    # Pass ship filter to query_fault_description (update query_pinecone.py if needed)
    result = query_fault_description(fault_input, ship_filter=ship)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)