from flask import Flask, request, jsonify, render_template
from query_pinecone import query_fault_description
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/diagnose", methods=["POST"])
def diagnose():
    try:
        data = request.json
        fault_input = data.get("fault_description")
        if not fault_input:
            return jsonify({"error": "Missing fault_description"}), 400
        result = query_fault_description(fault_input)
        # Split result into diagnosis and previous faults
        if "\n\n**Similar Past Fault:**\n" in result:
            diagnosis, previous_faults = result.split("\n\n**Similar Past Fault:**\n", 1)
            previous_faults = previous_faults.split("\n")
        else:
            diagnosis = result
            previous_faults = []
        return jsonify({"diagnosis": diagnosis, "previous_faults": previous_faults})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
