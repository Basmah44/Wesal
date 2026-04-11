import os
import json
import csv
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np

# ================== PATHS ==================
IMAGES_DIR = r"C:\SignLanguage1\images"          # فولدر الصور الرئيسي (داخله فولدرات الكلاسات)
OUT_CSV    = r"C:\SignLanguage1\all_landmarks_v2.csv"
OUT_LABELS = r"C:\SignLanguage1\labels_ar.json"  # ملف ربط انجليزي -> عربي (انتي تسوينه/نولد قالب)

# ================== SETTINGS ==================
STATIC_IMAGE_MODE = True
MAX_NUM_HANDS = 1
MIN_DET_CONF = 0.3

# ------------------ MediaPipe ------------------
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=STATIC_IMAGE_MODE,
    max_num_hands=MAX_NUM_HANDS,
    min_detection_confidence=MIN_DET_CONF
)

def list_image_files(folder: Path):
    exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    return [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in exts]

def extract_hand_landmarks(image_bgr):
    """Return 63 floats (21 points * xyz) or None if no hand detected."""
    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    res = hands.process(img_rgb)
    if not res.multi_hand_landmarks:
        return None
    lm = res.multi_hand_landmarks[0].landmark
    feats = []
    for pt in lm:
        feats.extend([pt.x, pt.y, pt.z])
    return feats

def main():
    base = Path(IMAGES_DIR)

    if not base.exists():
        print(f"[ERROR] IMAGES_DIR not found: {base}")
        return

    # كل فولدر داخل images يعتبر label
    class_dirs = [d for d in base.iterdir() if d.is_dir()]
    if not class_dirs:
        print("[ERROR] No class folders found inside IMAGES_DIR.")
        return

    # ترتيب ثابت
    class_dirs.sort(key=lambda p: p.name)

    print(f"Found {len(class_dirs)} classes.")
    total_saved = 0
    total_failed = 0
    failed_list = []

    # نكتب CSV: label + 63 feature
    header = ["label"] + [f"f{i}" for i in range(63)]

    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)

        for cdir in class_dirs:
            label = cdir.name  # لازم يكون انجليزي/أرقام عشان ما نتعب مع المسارات
            print(f"Processing: {label}")

            images = list_image_files(cdir)
            if not images:
                print(f"  [WARN] No images in: {cdir}")
                continue

            for img_path in images:
                img = cv2.imread(str(img_path))
                if img is None:
                    total_failed += 1
                    failed_list.append(str(img_path))
                    continue

                feats = extract_hand_landmarks(img)
                if feats is None:
                    total_failed += 1
                    failed_list.append(str(img_path))
                    continue

                writer.writerow([label] + feats)
                total_saved += 1

    print("\nDONE!")
    print(f"CSV created: {OUT_CSV}")
    print(f"Total samples saved: {total_saved}")
    print(f"Failed (no read/no hand): {total_failed}")

    # نحفظ ملف labels_ar.json كقالب إذا ما كان موجود
    labels_path = Path(OUT_LABELS)
    if not labels_path.exists():
        mapping = {d.name: d.name for d in class_dirs}  # قالب: انجليزي -> نفس الاسم
        with open(labels_path, "w", encoding="utf-8") as jf:
            json.dump(mapping, jf, ensure_ascii=False, indent=2)
        print(f"labels template created: {OUT_LABELS}")
        print("افتحه وغيّر القيم للعربي (مثلا w_salam: سلام).")

    # نخزن لستة الفاشلة
    if failed_list:
        fail_txt = str(Path(OUT_CSV).with_suffix(".failed.txt"))
        with open(fail_txt, "w", encoding="utf-8") as ff:
            ff.write("\n".join(failed_list))
        print(f"Failed list saved to: {fail_txt}")

if __name__ == "__main__":
    main()