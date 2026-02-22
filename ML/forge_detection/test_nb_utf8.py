!pip install ultralytics
from ultralytics import YOLO

from IPython.display import display, Image
!yolo task=detect mode=train model=yolov8n.pt data="/kaggle/input/educational-forge-unforge/Certificate forgery detection.v1i.yolov8-obb (1)/data.yaml" epochs=25 plots=True
import torch
import cv2
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import cohen_kappa_score, f1_score, precision_score, recall_score, confusion_matrix, jaccard_score

# Load model
model = YOLO("/kaggle/working/runs/detect/train5/weights/best.pt")  # or "yolov8m.pt" if fine-tuned in-place


# Evaluate on full validation set to get metrics
metrics = model.val(data="/kaggle/input/educational-forge-unforge/Certificate forgery detection.v1i.yolov8-obb (1)/data.yaml")

# Print built-in YOLOv8 metrics
print("YOLOv8 Evaluation Metrics:")
for key, value in metrics.results_dict.items():
    print(f"{key}: {value:.4f}")
from ultralytics import YOLO
import cv2
import os
import matplotlib.pyplot as plt

# Load YOLO model
model = YOLO("/kaggle/working/runs/detect/train5/weights/best.pt")

# Path to validation images directory
val_img_dir = "/kaggle/input/educational-forge-unforge/Certificate forgery detection.v1i.yolov8-obb (1)/valid/images"
valid_exts = ['.jpg', '.jpeg', '.png']

# Iterate through each validation image
for img_file in sorted(os.listdir(val_img_dir)):
    if any(img_file.lower().endswith(ext) for ext in valid_exts):
        img_path = os.path.join(val_img_dir, img_file)

        # Perform inference
        results = model(img_path, conf=0.25)

        # Show prediction image with bounding boxes
        results[0].show()


