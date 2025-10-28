from flask import Flask, render_template, request, jsonify
import os
from google import genai
from openai import OpenAI
from dotenv import load_dotenv
import PyPDF2

load_dotenv()

app = Flask(__name__)

# Gemini Client
gemini_client = genai.Client()

# Groq Client
groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    provider = request.form.get('provider', 'gemini')
    message = request.form['message']
    file = request.files.get('file')

    context = ""
    if file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            context += page.extract_text()

    prompt = f"{context}\n\n{message}"

    try:
        if provider == 'gemini':
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash", contents=prompt
            )
            reply = response.text
        elif provider == 'groq':
            response = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
            )
            reply = response.choices[0].message.content
        else:
            return jsonify({'error': 'Invalid provider specified'}), 400

        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
