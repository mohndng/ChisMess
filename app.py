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

@app.route('/models', methods=['GET'])
def get_models():
    # In a real-world scenario, you might want to dynamically fetch this list
    # and filter based on accessibility. For this example, we'll use a static list
    # of publicly known free-tier accessible models.
    models = [
        "gemini-1.5-flash",
        "gemini-1.0-pro",
    ]
    return jsonify(models)

@app.route('/chat', methods=['POST'])
def chat():
    message = request.form['message']
    model = request.form.get('model', 'gemini-1.5-flash') # Default to a known free model
    file = request.files.get('file')

    context = ""
    if file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            context += page.extract_text()

    prompt = f"{context}\n\n{message}"

    try:
        response = client.models.generate_content(
            model=model, contents=prompt
        )
        return jsonify({'reply': response.text})
    except Exception as e:
        # Log the error for debugging
        print(f"Error generating content with model {model}: {e}")
        # Provide a user-friendly error message
        return jsonify({'error': f"Sorry, there was an error processing your request with the selected model. Please try another model or contact support."}), 500

if __name__ == '__main__':
    app.run(debug=True)
