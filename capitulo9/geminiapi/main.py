import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import errors
from google.genai.types import  GenerateContentConfig
import logging

#-.delete in production-.-.
load_dotenv()

app = Flask(__name__)

logger=logging.getLogger("flask_app")
CORS(app, resources={r"/*": {"origins": "*"}})

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.5"))

if not GOOGLE_API_KEY:
    raise RuntimeError("Falta GOOGLE_API_KEY en variables de entorno")

client = genai.Client(api_key=GOOGLE_API_KEY)



@app.get("/health")
def health():
    logger.info("Comprobación de estado realizada")
    return jsonify(status="ok"), 200

@app.route("/chat", methods=["POST"])
def generate():
    logger.info("Solicitud de generación recibida")
    """
    Body esperado (JSON):
    {
      "prompt": "Escribe un haiku sobre microservicios",
      "system_instruction": "Eres un experto en ...",  # opcional
    }
    """
    data = request.get_json()
    prompt = data.get("prompt").strip()
    if not prompt:
        return jsonify(error="El campo 'prompt' es requerido"), 400

    model = DEFAULT_MODEL
    temperature = TEMPERATURE
    system_instruction = data.get("system_instruction")


    contents = [prompt]
    response = None
    try:
        if system_instruction:
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=GenerateContentConfig(
                    temperature=temperature, 
                    system_instruction=system_instruction)

            )
        else:
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=GenerateContentConfig(temperature=temperature)
            )
        logger.info("Generación completada")
        return jsonify(response=response.text), 200


    except errors.APIError as e:
        return jsonify(error="Prompt bloqueado por políticas", details=str(e)), 400
    except errors.ClientError as e:
        return jsonify(error="Error API Gemini", details=str(e)), 502
    except Exception as e:
        return jsonify(error="Error interno", details=str(e)), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")), debug=False)
