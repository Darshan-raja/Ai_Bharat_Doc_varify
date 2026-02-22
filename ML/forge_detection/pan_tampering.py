import cv2


def detect_pan_tampering(image_path: str):
    image = cv2.imread(image_path)

    if image is None:
        return {
            "tampering_result": "SUSPICIOUS",
            "tampering_score": 1.0
        }

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 1. Blur Detection (Existing)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # 2. Digital Forgery / Noise Analysis (New)
    # Detects inconsistent compression/noise common in photoshopped areas
    median = cv2.medianBlur(gray, 3)
    noise = cv2.absdiff(gray, median)
    noise_variance = cv2.meanStdDev(noise)[1][0][0] ** 2

    # High quality documents usually have low, uniform noise. 
    # High variance indicates stitched or manipulated textures.
    is_suspicious_noise = noise_variance > 100

    if blur_score < 120 or is_suspicious_noise:
        # Increase tampering score if noise is the culprit
        score = 0.9 if is_suspicious_noise else 0.8
        return {
            "tampering_result": "SUSPICIOUS",
            "tampering_score": score,
            "details": "Inconsistent textures/compression detected" if is_suspicious_noise else "Document is too blurry"
        }

    return {
        "tampering_result": "AUTHENTIC",
        "tampering_score": 0.2
    }
