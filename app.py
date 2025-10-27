from flask import Flask, render_template, request, jsonify
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-pro')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json['message']
    response = model.generate_content(message)
    return jsonify({'reply': response.text})

if __name__ == '__main__':
    app.run(debug=True)
