from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from safe_ai_query import query_fault_description_safe
import jsPDF  # For PDF generation; install with pip install jsPDF if needed, but for server-side PDF, use reportlab or pdfkit
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from flask import send_file

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
print("Loaded env - PINECONE_API_KEY:", bool(os.getenv("PINECONE_API_KEY")))  # Debug print

app = Flask(__name__)
CORS(app, origins=[
    "https://www.vectorscan.io",
    "https://app.flutterflow.io",
    "https://your-flutter-app-domain.com"
], supports_credentials=True, methods=["GET", "POST", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secure-key')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')  # For session
jwt = JWTManager(app)

# Mock user database (replace with PostgreSQL for production)
users = {
    'engineer_iona': {'password': 'pass123', 'role': 'ETO_Iona', 'ship': 'Iona'},
    'engineer_wonder': {'password': 'pass456', 'role': 'ETO_Wonder', 'ship': 'Wonder of the Seas'},
    'engineer_wind': {'password': 'pass789', 'role': 'ETO_WindSurf', 'ship': 'Wind Surf'},
    'admin': {'password': 'admin123', 'role': 'Admin', 'ship': 'All'}
}

@app.route('/', methods=['GET'])
def landing():
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and users[username]['password'] == password:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('query'))
        else:
            return render_template('landing.html', error='Invalid credentials')
    return render_template('landing.html')

@app.route('/query', methods=['GET', 'POST'])
def query():
    if 'logged_in' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        fault_description = request.form['fault_description']
        result = query_fault_description_safe(fault_description, ship_filter=users[session['username']]['ship'])
        return render_template('query.html', result=result)
    return render_template('query.html')

@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    result = request.form['result']
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, 750, "Diagnosis Result")
    # Parse and add sections - similar to your parseResult function
    sections = { 'diagnosis': '', 'cause': '', 'resolution': '', 'similarFaults': '', 'status': '' }
    lines = result.split('\n')
    currentSection = ''
    for line in lines:
        if line.startsWith('**Diagnosis:**'):
            currentSection = 'diagnosis'
        elif line.startsWith('**Cause:**'):
            currentSection = 'cause'
        elif line.startsWith('**Resolution:**'):
            currentSection = 'resolution'
        elif line.startsWith('**Similar Past Faults:**'):
            currentSection = 'similarFaults'
        elif line.startsWith('**Status:**'):
            currentSection = 'status'
        elif currentSection:
            sections[currentSection] += line + '\n'
    y = 700
    for section in sections:
        c.drawString(100, y, section.capitalize() + ":")
        y -= 20
        c.drawString(120, y, sections[section].strip())
        y -= 40
    c.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, attachment_filename='diagnosis.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)