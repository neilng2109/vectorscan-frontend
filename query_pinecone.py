from dotenv import load_dotenv
import os
import logging
from datetime import datetime, timedelta
from uuid import uuid4
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from safe_ai_query import query_fault_description_safe

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app, origins=[
    "https://www.vectorscan.io",
    "https://app.flutterflow.io",
    "https://your-flutter-app-domain.com"
], supports_credentials=False, methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"])

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
if not app.config['JWT_SECRET_KEY']:
    raise ValueError("JWT_SECRET_KEY not set in .env")

# Token expiry for improved security
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)
jwt = JWTManager(app)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock user database (replace with secure DB in production)
users = {
    'engineer_iona': {'password': 'pass123', 'role': 'ETO_Iona', 'ship': 'Iona'},
    'engineer_wonder': {'password': 'pass456', 'role': 'ETO_Wonder', 'ship': 'Wonder of the Seas'},
    'engineer_wind': {'password': 'pass789', 'role': 'ETO_WindSurf', 'ship': 'Wind Surf'},
    'admin': {'password': 'admin123', 'role': 'Admin', 'ship': 'All'}
}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'VectorScan API'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    logger.info(f"Raw request data: {request.get_data(as_text=True)}")  # Log raw data
    logger.info(f"Parsed JSON data: {data}")  # Log parsed data
    try:
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        if username in users and users[username]['password'] == password:
            identity = {'username': username, 'role': users[username]['role'], 'ship': users[username]['ship']}
            access_token = create_access_token(identity=identity)
            logger.info(f"Successful login for {username}")
            return jsonify({'token': access_token, 'user': identity}), 200
        logger.warning(f"Invalid login attempt for {username} with data: {data}")
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        logger.exception("Login error")
        return jsonify({'error': f'Login error: {str(e)}'}), 500

@app.route('/query', methods=['POST'])
@jwt_required()
def query_fault():
    trace_id = str(uuid4())
    current_user = get_jwt_identity()
    user_ship = current_user.get('ship', 'Unknown')

    try:
        data = request.json or {}
        fault_input = (data.get('fault_description') or '').strip()

        # Require explicit target ship if user has 'All'
        target_ship = (data.get('ship') or '').strip() if user_ship == 'All' else user_ship
        if user_ship == 'All' and not target_ship:
            return jsonify({
                "error": {
                    "code": "SHIP_REQUIRED",
                    "message": "Target ship must be specified for admin queries.",
                    "hint": "Include 'ship' in the request body.",
                    "traceId": trace_id
                }
            }), 400

        # Basic validation
        if not fault_input or len(fault_input) > 500:
            return jsonify({
                "error": {
                    "code": "INVALID_INPUT",
                    "message": "Fault description is required and must be under 500 characters.",
                    "hint": "Provide a short text describing the issue.",
                    "traceId": trace_id
                }
            }), 400

        # Call AI/Pinecone
        ai_result = query_fault_description_safe(
            fault_input,
            ship_filter=target_ship
        )

        if not ai_result:
            return jsonify({
                "error": {
                    "code": "NO_MATCH",
                    "message": "No relevant history found for this ship.",
                    "hint": "Refine the description or verify equipment context.",
                    "traceId": trace_id
                }
            }), 404

        # Normalize AI result to a predictable shape
        if isinstance(ai_result, dict):
            result_payload = {
                "faultSummary": ai_result.get("faultSummary") or "No summary available",
                "severity": ai_result.get("severity") or "unknown",
                "confidence": ai_result.get("confidence") or 0.0,
                "nextBestActions": ai_result.get("nextBestActions") or [],
                "troubleshootingLog": ai_result.get("troubleshootingLog") or [],
                "referenceLinks": ai_result.get("referenceLinks") or [],
                "sources": ai_result.get("sources") or []
            }
        else:
            preview = ai_result.strip().split("\n")[0][:180] if isinstance(ai_result, str) else ""
            result_payload = {
                "faultSummary": preview or "Diagnostic summary unavailable",
                "severity": "unknown",
                "confidence": 0.0,
                "nextBestActions": [],
                "troubleshootingLog": [],
                "referenceLinks": [],
                "sources": []
            }

        response = {
            "ship": {"shipId": target_ship, "name": target_ship},
            "operator": {
                "username": current_user.get('username'),
                "role": current_user.get('role')
            },
            "query": {
                "faultDescription": fault_input,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            },
            "result": result_payload,
            "meta": {
                "traceId": trace_id,
                "modelVersion": "vectorscan-agent-1.2.0",
                "generatedAt": datetime.utcnow().isoformat() + "Z"
            }
        }

        logger.info(f"query_ok traceId={trace_id} user={current_user.get('username')} ship={target_ship}")
        return jsonify(response), 200

    except Exception as e:
        logger.exception(f"query_err traceId={trace_id}")
        return jsonify({
            "error": {
                "code": "QUERY_ERROR",
                "message": "AI service temporarily unavailable.",
                "hint": "Try again shortly or contact technical support.",
                "traceId": trace_id
            }
        }), 503

@app.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    return jsonify({'user': get_jwt_identity()}), 200

@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404: {error}")
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# Heroku production setup
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
