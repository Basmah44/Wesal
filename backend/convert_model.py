import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import joblib
from collections import deque
from PIL import ImageFont, ImageDraw, Image
import arabic_reshaper
from bidi.algorithm import get_display

# ===============================
# Load models
# ===============================

models = {
    "letters": {
        "model": tf.keras.models.load_model("C:\\SignLanguage1\\letters_mlp_model.h5"),
        "scaler": joblib.load("C:\\SignLanguage1\\letters_scaler.save"),
        "encoder": joblib.load("C:\\SignLanguage1\\letters_label_encoder.save"),
    },
    "numbers": {
        "model": tf.keras.models.load_model("C:\\SignLanguage1\\numbers_mlp_model.h5"),
        "scaler": joblib.load("C:\\SignLanguage1\\numbers_scaler.save"),
        "encoder": joblib.load("C:\\SignLanguage1\\numbers_label_encoder.save"),
    },
    "word": {
        "model": tf.keras.models.load_model("C:\\SignLanguage1\\word_mlp_model.h5"),
        "scaler": joblib.load("C:\\SignLanguage1\\word_scaler.save"),
        "encoder": joblib.load("C:\\SignLanguage1\\word_label_encoder.save"),
    }
}

current_mode = "letters"

# ===============================
# Prediction smoothing
# ===============================

prediction_buffer = deque(maxlen=3)

# ===============================
# English → Arabic mapping
# ===============================

arabic_map = {
 "1": "1",
  "10": "10",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "Above": "فوق",
  "Ain": "ع",
  "Alef": "أ",
  "Annoyed": "منزعج",
  "At": "عند",
  "Ba": "ب",
  "Bad": "سئ",
  "Bed": "سرير",
  "Berry": "توت",
  "Chair": "كرسي",
  "Charger": "شاحن",
  "Company": "شركة",
  "Cooperation": "تعاون",
  "Dad": "ض",
  "Dal": "د",
  "Dimond Shap": "معين",
  "Fa": "ف",
  "Father": "اب",
  "Football": "كورة",
  "Friend": "صديق",
  "Ghain": "غ",
  "Good": "جيد",
  "Grandfather": "جد",
  "Ha": "ه",
  "Haa": "ح",
  "Hilal": "هلال",
  "Home": "بيت",
  "Jeem": "ج",
  "Kaf": "ك",
  "Khaa": "خ",
  "Lam": "ل",
  "Left": "يسار",
  "Loves": "يحب",
  "Mall": "مول",
  "Meem": "م",
  "Mosque": "مسجد",
  "Mother": "ام",
  "My": "انا",
  "Noon": "ن",
  "Playground": "ملعب",
  "Prince": "امير",
  "Qaf": "ق",
  "Ra": "ر",
  "Right": "يمين",
  "Sad": "ص",
  "School": "مدرسة",
  "Seen": "س",
  "Sheen": "ش",
  "Smile": "ابتسامة",
  "Sofa": "كنب",
  "Sorry": "اسف",
  "TV": "تلفزيون",
  "Ta": "ت",
  "Taa Marbuta": "ة",
  "Tah": "ط",
  "Tha": "ث",
  "Thal": "ذ",
  "Today": "اليوم",
  "Triangle": "مثلث",
  "University": "جامعة",
  "Waiting": "انتظار",
  "Waw": "و",
  "Ya": "ي",
  "Zah": "ظ",
  "Zay": "ز"
}

# ===============================
# MediaPipe
# ===============================

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

# ===============================
# Arabic Font (Windows)
# ===============================

font = ImageFont.truetype("C:\\Windows\\Fonts\\tahoma.ttf", 40)

print("Press L for Letters")
print("Press N for Numbers")
print("Press W for Words")
print("Press ESC to Exit")

while True:

    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame,1)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    prediction_text = f"Mode: {current_mode}"

    if results.multi_hand_landmarks:

        for hand_landmarks in results.multi_hand_landmarks:

            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            landmarks = []

            for lm in hand_landmarks.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])

            if len(landmarks) == 63:

                data = np.array(landmarks).reshape(1,-1)

                scaler = models[current_mode]["scaler"]
                model = models[current_mode]["model"]
                encoder = models[current_mode]["encoder"]

                data = scaler.transform(data)

                preds = model.predict(data, verbose=0)

                class_id = np.argmax(preds)
                confidence = np.max(preds)

                if confidence > 0.70:

                    english_word = encoder.inverse_transform([class_id])[0]

                    word = arabic_map.get(english_word, english_word)

                    prediction_buffer.append(word)
                    stable_prediction = max(set(prediction_buffer), key=prediction_buffer.count)

                    prediction_text = f"{stable_prediction}"

                else:

                    prediction_text = "..."

    # ===============================
    # Draw Arabic text
    # ===============================

    img_pil = Image.fromarray(frame)
    draw = ImageDraw.Draw(img_pil)

    reshaped_text = arabic_reshaper.reshape(prediction_text)
    bidi_text = get_display(reshaped_text)

    draw.text((20,40), bidi_text, font=font, fill=(0,255,0))
    frame = np.array(img_pil)

    cv2.imshow("Sign Language Camera", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('l'):
        current_mode = "letters"

    elif key == ord('n'):
        current_mode = "numbers"

    elif key == ord('w'):
        current_mode = "word"

    elif key == 27:
        break

cap.release()
cv2.destroyAllWindows()