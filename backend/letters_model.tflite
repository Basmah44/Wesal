import os
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd

# ===============================
# 🔹 غيري هذا حسب المود
# ===============================
MODE_NAME = "letters"  # letters / numbers / word
BASE_PATH = rf"C:\SignLanguage1\images\{MODE_NAME}"
OUTPUT_CSV = rf"C:\SignLanguage1\{MODE_NAME}_landmarks.csv"

# ===============================
# MediaPipe setup
# ===============================
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)

data = []

print(f"\n Processing mode: {MODE_NAME}\n")

for label in os.listdir(BASE_PATH):
    label_path = os.path.join(BASE_PATH, label)

    if not os.path.isdir(label_path):
        continue

    print(f"Processing: {label}")

    for img_name in os.listdir(label_path):
        img_path = os.path.join(label_path, img_name)

        img = cv2.imread(img_path)
        if img is None:
            continue

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.extend([lm.x, lm.y, lm.z])

                landmarks.append(label)
                data.append(landmarks)

print("\nExtraction complete")

# ===============================
# Save CSV
# ===============================
columns = []

for i in range(21):
    columns += [f"x{i}", f"y{i}", f"z{i}"]

columns.append("label")

df = pd.DataFrame(data, columns=columns)
df.to_csv(OUTPUT_CSV, index=False)

print(f"\n Saved CSV: {OUTPUT_CSV}")
print(f"Total samples: {len(df)}")