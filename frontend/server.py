from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import tensorflow as tf
import cv2
import mediapipe as mp
import os
import json

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

LETTERS_MODEL_PATH = os.path.join(MODELS_DIR, "letters_model.tflite")
LETTERS_SCALER_PATH = os.path.join(MODELS_DIR, "letters_scaler.save")
LETTERS_ENCODER_PATH = os.path.join(MODELS_DIR, "letters_label_encoder.save")

NUMBERS_MODEL_PATH = os.path.join(MODELS_DIR, "numbers_model.tflite")
NUMBERS_SCALER_PATH = os.path.join(MODELS_DIR, "numbers_scaler.save")
NUMBERS_ENCODER_PATH = os.path.join(MODELS_DIR, "numbers_label_encoder.save")

WORD_MODEL_PATH = os.path.join(MODELS_DIR, "word_model.tflite")
WORD_SCALER_PATH = os.path.join(MODELS_DIR, "word_scaler.save")
WORD_ENCODER_PATH = os.path.join(MODELS_DIR, "word_label_encoder.save")

LABELS_AR_PATH = os.path.join(MODELS_DIR, "labels_ar.json")

labels_ar = {}

if os.path.exists(LABELS_AR_PATH):
    with open(LABELS_AR_PATH, "r", encoding="utf-8") as f:
        labels_ar = json.load(f)

def map_to_arabic(mode, prediction):
    if not isinstance(labels_ar, dict):
        return prediction

    if prediction in labels_ar:
        return labels_ar[prediction]

    if mode in labels_ar and isinstance(labels_ar[mode], dict):
        if prediction in labels_ar[mode]:
            return labels_ar[mode][prediction]

    return prediction

def load_model_bundle(model_path, scaler_path, encoder_path):
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()

    scaler = joblib.load(scaler_path)
    encoder = joblib.load(encoder_path)

    return interpreter, scaler, encoder

letters_interpreter, letters_scaler, letters_encoder = load_model_bundle(
    LETTERS_MODEL_PATH,
    LETTERS_SCALER_PATH,
    LETTERS_ENCODER_PATH
)

numbers_interpreter, numbers_scaler, numbers_encoder = load_model_bundle(
    NUMBERS_MODEL_PATH,
    NUMBERS_SCALER_PATH,
    NUMBERS_ENCODER_PATH
)

word_interpreter, word_scaler, word_encoder = load_model_bundle(
    WORD_MODEL_PATH,
    WORD_SCALER_PATH,
    WORD_ENCODER_PATH
)

# 🔥 تحسين السرعة هنا
mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=False,   # 🚀 أهم تعديل
    max_num_hands=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

def run_prediction(interpreter, scaler, encoder, landmarks):
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    data = np.array(landmarks).reshape(1, -1)
    data = scaler.transform(data)

    interpreter.set_tensor(
        input_details[0]["index"],
        data.astype(np.float32)
    )

    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]["index"])
    pred_index = int(np.argmax(output))
    prediction = encoder.inverse_transform([pred_index])[0]

    return str(prediction)

@app.route("/")
def home():
    return jsonify({"message": "Sign Language AI Server Running"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image received"}), 400

        raw_mode = request.form.get("mode", "letters")

        if raw_mode in ["الأرقام", "numbers"]:
            mode = "numbers"
        elif raw_mode in ["الكلمات", "words"]:
            mode = "words"
        else:
            mode = "letters"

        file = request.files["image"]

        npimg = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Invalid image"}), 400

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)

        if not results.multi_hand_landmarks:
            return jsonify({"prediction": "لا توجد يد"})

        hand_landmarks = results.multi_hand_landmarks[0]

        landmarks = []
        for lm in hand_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])

        if mode == "numbers":
            prediction = run_prediction(
                numbers_interpreter,
                numbers_scaler,
                numbers_encoder,
                landmarks
            )

        elif mode == "words":
            prediction = run_prediction(
                word_interpreter,
                word_scaler,
                word_encoder,
                landmarks
            )

        else:
            prediction = run_prediction(
                letters_interpreter,
                letters_scaler,
                letters_encoder,
                landmarks
            )

        prediction = map_to_arabic(mode, prediction)

        print(f"Mode: {mode} | Prediction: {prediction}")

        return jsonify({"prediction": prediction})

    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Server running on http://192.168.8.145:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
