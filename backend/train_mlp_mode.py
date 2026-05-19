import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.utils.class_weight import compute_class_weight
from tensorflow import keras
from tensorflow.keras import layers
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix
)

# ===============================
# ===============================
MODE_NAME = "letters"  # letters / numbers / word

# ===============================
# Load data
# ===============================
df = pd.read_csv(f"C:\\SignLanguage1\\{MODE_NAME}_landmarks.csv")

X = df.drop("label", axis=1).values
y = df["label"].values

# ===============================
# Encode labels
# ===============================
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# ===============================
# Stratified K-Fold
# ===============================
skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

fold_accuracies = []
fold_losses = []
fold_precisions = []
fold_recalls = []
fold_f1s = []

last_history = None
last_y_test = None
last_y_pred = None

# ===============================
# Cross Validation Loop
# ===============================
for fold_no, (train_idx, test_idx) in enumerate(skf.split(X, y_encoded), start=1):
    print(f"\n========== Fold {fold_no} ==========")

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y_encoded[train_idx], y_encoded[test_idx]

    # ===============================
    # Scale features داخل كل Fold
    # ===============================
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # ===============================
    # Compute Class Weights
    # ===============================
    class_weights = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(y_train),
        y=y_train
    )

    class_weights_dict = dict(enumerate(class_weights))

    # ===============================
    # Build MLP model
    # ===============================
    model = keras.Sequential([
        layers.Dense(256, activation="relu", input_shape=(63,)),
        layers.BatchNormalization(),
        layers.Dropout(0.4),

        layers.Dense(128, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.3),

        layers.Dense(64, activation="relu"),
        layers.Dropout(0.2),

        layers.Dense(len(le.classes_), activation="softmax")
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    # ===============================
    # Callbacks
    # ===============================
    early_stop = keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=10,
        restore_best_weights=True
    )

    reduce_lr = keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=5,
        min_lr=1e-5
    )

    # ===============================
    # Train
    # ===============================
    history = model.fit(
        X_train, y_train,
        epochs=70,
        batch_size=32,
        validation_data=(X_test, y_test),
        shuffle=True,
        class_weight=class_weights_dict,
        callbacks=[early_stop, reduce_lr],
        verbose=0
    )

    # ===============================
    # Best training / validation metrics
    # ===============================
    best_train_acc = max(history.history["accuracy"])
    best_val_acc = max(history.history["val_accuracy"])
    best_train_loss = min(history.history["loss"])
    best_val_loss = min(history.history["val_loss"])

    print(f"\nFold {fold_no} Best Training Accuracy: {best_train_acc:.4f}")
    print(f"Fold {fold_no} Best Validation Accuracy: {best_val_acc:.4f}")
    print(f"Fold {fold_no} Best Training Loss: {best_train_loss:.4f}")
    print(f"Fold {fold_no} Best Validation Loss: {best_val_loss:.4f}")

    # ===============================
    # Evaluate
    # ===============================
    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nFold {fold_no} Test Accuracy: {acc:.4f}")

    # ===============================
    # Extra evaluation metrics
    # ===============================
    y_pred_probs = model.predict(X_test, verbose=0)
    y_pred = np.argmax(y_pred_probs, axis=1)

    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print(f"Fold {fold_no} Test Loss: {loss:.4f}")
    print(f"Fold {fold_no} Test Precision: {precision:.4f}")
    print(f"Fold {fold_no} Test Recall: {recall:.4f}")
    print(f"Fold {fold_no} Test F1-score: {f1:.4f}")

    fold_accuracies.append(acc)
    fold_losses.append(loss)
    fold_precisions.append(precision)
    fold_recalls.append(recall)
    fold_f1s.append(f1)

    # حفظ آخر Fold فقط للرسوم و Confusion Matrix
    last_history = history
    last_y_test = y_test
    last_y_pred = y_pred

# ===============================
# Final Average Results
# ===============================
avg_acc = np.mean(fold_accuracies)
avg_loss = np.mean(fold_losses)
avg_precision = np.mean(fold_precisions)
avg_recall = np.mean(fold_recalls)
avg_f1 = np.mean(fold_f1s)

print("\n========== Final Average Results ==========")
print(f"Average Accuracy: {avg_acc:.4f}")
print(f"Average Loss: {avg_loss:.4f}")
print(f"Average Precision: {avg_precision:.4f}")
print(f"Average Recall: {avg_recall:.4f}")
print(f"Average F1-score: {avg_f1:.4f}")

print("\nClassification Report (Last Fold):")
print(classification_report(
    last_y_test,
    last_y_pred,
    target_names=[str(label) for label in le.classes_],
    zero_division=0
))

# ===============================
# Save metrics to text file
# ===============================
with open(f"C:\\SignLanguage1\\{MODE_NAME}_metrics.txt", "w", encoding="utf-8") as f:
    f.write(f"Average Accuracy: {avg_acc:.4f}\n")
    f.write(f"Average Loss: {avg_loss:.4f}\n")
    f.write(f"Average Precision: {avg_precision:.4f}\n")
    f.write(f"Average Recall: {avg_recall:.4f}\n")
    f.write(f"Average F1-score: {avg_f1:.4f}\n")

# ===============================
# Confusion Matrix
# ===============================
cm = confusion_matrix(last_y_test, last_y_pred)

plt.figure(figsize=(10, 8))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=le.classes_,
    yticklabels=le.classes_
)
plt.title(f"{MODE_NAME.capitalize()} Confusion Matrix")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.tight_layout()
plt.savefig(f"C:\\SignLanguage1\\{MODE_NAME}_confusion_matrix.png")
plt.show()

# ===============================
# Plot Accuracy
# ===============================
plt.figure(figsize=(8, 5))
plt.plot(last_history.history["accuracy"], label="Training Accuracy")
plt.plot(last_history.history["val_accuracy"], label="Validation Accuracy")
plt.title(f"{MODE_NAME.capitalize()} Model Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig(f"C:\\SignLanguage1\\{MODE_NAME}_accuracy_plot.png")
plt.show()

# ===============================
# Plot Loss
# ===============================
plt.figure(figsize=(8, 5))
plt.plot(last_history.history["loss"], label="Training Loss")
plt.plot(last_history.history["val_loss"], label="Validation Loss")
plt.title(f"{MODE_NAME.capitalize()} Model Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig(f"C:\\SignLanguage1\\{MODE_NAME}_loss_plot.png")
plt.show()

# ===============================
# Save everything
# ===============================
model.save(f"C:\\SignLanguage1\\{MODE_NAME}_mlp_model.h5")
joblib.dump(scaler, f"C:\\SignLanguage1\\{MODE_NAME}_scaler.save")
joblib.dump(le, f"C:\\SignLanguage1\\{MODE_NAME}_label_encoder.save")

print("\nModel saved successfully!")
