from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from query_pinecone import query_fault_description
import os

app = Flask(__name__, template_folder='templates')
CORS(app, origins=["http://localhost:3000", "http://vectorscan.io:3000"])
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secure-key')
jwt = JWTManager(app)

# Mock user database
users = {
    'engineer_iona': {'password': 'pass123', 'role': 'ETO_Iona', 'ship': 'Iona'},
    'engineer_wonder': {'password': 'pass456', 'role': 'ETO_Wonder', 'ship': 'Wonder of the Seas'},
    'engineer_wind': {'password': 'pass789', 'role': 'ETO_WindSurf', 'ship': 'Wind Surf'},
    'admin': {'password': 'admin123', 'role': 'Admin', 'ship': 'All'}
}

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username in users and users[username]['password'] == password:
        access_token = create_access_token(identity={'username': username, 'role': users[username]['role'], 'ship': users[username]['ship']})
        return jsonify(token=access_token), 200
    return jsonify(error='Invalid credentials'), 401

@app.route('/query', methods=['GET', 'POST'])
@jwt_required()
def query():
    current_user = get_jwt_identity()
    ship = current_user['ship']
    if request.method == 'POST':
        data = request.json
        fault_input = data.get('fault_description', '')
        if not fault_input:
            return jsonify({'error': 'Fault description required'}), 400
        result = query_fault_description(fault_input, ship_filter=ship)
        return jsonify({'result': result})
    return render_template('query.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)