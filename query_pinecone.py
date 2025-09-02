from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret-jwt-key'  # Match .env
jwt = JWTManager(app)
CORS(app, resources={r"/login": {"origins": "http://localhost:5173"}}, supports_credentials=True)  # Allow localhost for dev

@app.route('/login', methods=['POST', 'OPTIONS'])  # Handle OPTIONS for preflight
def login():
    if request.method == 'OPTIONS':
        return '', 200  # Return 200 OK for preflight
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == 'password':  # Replace with secure auth
        token = create_access_token(identity=username)
        return jsonify({'token': token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)