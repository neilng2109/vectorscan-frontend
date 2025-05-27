from flask import Flask, request, jsonify
from flask_cors import CORS
from query_pinecone import query_fault_description

app = Flask(__name__)
CORS(app)  # Enable CORS for React UI

@app.route('/')
def home():
    return jsonify({'message': 'VectorScan API is running. Use POST /query to diagnose faults.'})

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    fault_input = data.get('fault_input', '')
    if not fault_input:
        return jsonify({'error': 'Fault description required'}), 400
    result = query_fault_description(fault_input)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)