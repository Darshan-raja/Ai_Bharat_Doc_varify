import cv2


def detect_pan_tampering(image_path: str):
    image = cv2.imread(image_path)

    if image is None:
        return {
            "tampering_result": "SUSPICIOUS",
            "tampering_score": 1.0
        }

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()

    if blur_score < 120:
        return {
            "tampering_result": "SUSPICIOUS",
            "tampering_score": 0.8
        }

    return {
        "tampering_result": "AUTHENTIC",
        "tampering_score": 0.2
    }
