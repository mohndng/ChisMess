from flask import Flask, render_template, request, jsonify
import os
from google import genai
from dotenv import load_dotenv
import PyPDF2

load_dotenv()

app = Flask(__name__)

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.form['message']
    file = request.files.get('file')

    context = ""
    if file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            context += page.extract_text()

    prompt = f"{context}\n\n{message}"

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=prompt
    )
    return jsonify({'reply': response.text})

if __name__ == '__main__':
    app.run(debug=True)
