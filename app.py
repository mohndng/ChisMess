from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json['message']
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(message)
    return jsonify({'reply': response.text})

if __name__ == '__main__':
    app.run(debug=True)
