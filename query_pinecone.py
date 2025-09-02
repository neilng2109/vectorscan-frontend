from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from flask_cors import CORS  # Ensure this is imported

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret-jwt-key'  # Match .env
jwt = JWTManager(app)
CORS(app, resources={r"/login": {"origins": "http://localhost:5173"}}, supports_credentials=True)  # Development CORS

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == 'password':  # Replace with secure auth
        token = create_access_token(identity=username)
        return jsonify({'token': token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)