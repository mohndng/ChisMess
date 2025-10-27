from flask import Flask, render_template, request, jsonify
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json['message']
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=message
    )
    return jsonify({'reply': response.text})

if __name__ == '__main__':
    app.run(debug=True)
