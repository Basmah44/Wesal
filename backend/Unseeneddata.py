# ادوات التقييم من sklearn 
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

y_true = ["مثلث","معين","ابتسامه","شركة","صديق","امير","انا","جد","مسجد","بيت","1","10","8","3","6","س","أ","ب","ة","ت","خ","ل","ن","مول","سئ","ملعب","اسف","7","9","ر","ح","م","2","4","5"]
y_pred = ["مثلث","معين","ابتسامه","شركة","لم يتم التعرف","شركة","لم يتم التعرف","جد","مسجد","بيت","10","10","8","9","6","س","أ","ط","ز","ت","خ","ل","ن","مول","سئ","ملعب","اسف","7","9","ر","خ","م","2","4","5"]
# كم بريدكشن صحيح من التوقعات 
accuracy = accuracy_score(y_true, y_pred)
#لما المودل يتوقع كلاس معين ؟ كم مره ص حفعلا
precision = precision_score(y_true, y_pred, average="weighted", zero_division=0)
# recall ==> العينات كم صح 
recall = recall_score(y_true, y_pred, average="weighted", zero_division=0)
# يجمع ال f1 + recall 
f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

print("Accuracy:", accuracy)
print("Precision:", precision)
print("Recall:", recall)
print("F1-score:", f1)

print("\nClassification Report:")
# يعرض التقاريرلكل كلاس 
print(classification_report(y_true, y_pred, zero_division=0))

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))
