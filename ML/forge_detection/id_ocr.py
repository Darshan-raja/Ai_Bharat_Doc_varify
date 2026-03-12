import easyocr
import re
import cv2
import numpy as np

# Initialize reader with English only (Hindi model can cause issues)
reader = easyocr.Reader(['en'], gpu=False)


def preprocess_image(image_path):
    """Preprocess image for better OCR accuracy"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply adaptive thresholding to handle different lighting
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)

        return denoised
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return None


def extract_text(image_path):
    """Extract text with preprocessing for more consistent results"""
    try:
        # Try with preprocessed image first
        preprocessed = preprocess_image(image_path)

        if preprocessed is not None:
            # Run OCR on preprocessed image
            results = reader.readtext(preprocessed, detail=0)
            text1 = " ".join(results).upper()

            # Also run on original for comparison
            results2 = reader.readtext(image_path, detail=0)
            text2 = " ".join(results2).upper()

            # Return the longer result (usually more complete)
            return text1 if len(text1) >= len(text2) else text2
        else:
            results = reader.readtext(image_path, detail=0)
            return " ".join(results).upper()
    except Exception as e:
        print(f"OCR error: {e}")
        return ""


def extract_name_from_text(text):
    """
    Try to extract name from OCR text.
    Looks for 'NAME:' or similar patterns followed by a name.
    """
    # Try common patterns like "NAME: John Doe" or "नाम / NAME:"
    patterns = [
        # Standard NAME: format
        r"NAME\s*:?\s*([A-Z\s]{3,}?)(?=\n|ADDRESS|AGE|DOB|FATHER|MOTHER|GENDER|$)",
        # Hindi and English mix
        r"नाम\s*/?.*?NAME\s*:?\s*([A-Z\s]{3,}?)(?=\n|ADDRESS|AGE|DOB|$)",
        # Just Hindi
        r"नाम\s*/?([A-Z\s]{3,}?)(?=\n|ADDRESS|MALE|FEMALE|FATHER|$)",
        # Passport format - often the first substantial text block is the name
        r"^([A-Z][A-Z\s]{3,}?)(?=\n|PASSPORT|DOB|FATHER)",
        # Format: SURNAME / GIVEN NAME
        r"([A-Z\s]{3,}?)\s*/?(?=\n|PASSPORT NUMBER|DOB|$)",
    ]

    text_normalized = text.strip()
    for pattern in patterns:
        match = re.search(pattern, text_normalized, re.IGNORECASE | re.DOTALL)
        if match:
            name = match.group(1).strip()
            # Clean up the name - remove extra spaces and unwanted characters
            name = " ".join(name.split())
            # Validate name length and quality
            if len(name) > 2 and len(name) < 100:
                # Remove common keywords that shouldn't be in names
                if not any(keyword in name for keyword in ["NUMBER", "PASSPORT", "BIRTH", "AADHAAR"]):
                    return name

    return None


def extract_address_from_text(text):
    """
    Try to extract address from OCR text.
    Looks for 'ADDRESS:' or similar patterns.
    """
    patterns = [
        # Standard ADDRESS: format
        r"ADDRESS\s*:?\s*([A-Z0-9,\.\s]{5,}?)(?=\n|PINCODE|PIN|PHONE|DOB|$)",
        # Hindi and English mix
        r"पता\s*/?.*?ADDRESS\s*:?\s*([A-Z0-9,\.\s]{5,}?)(?=\n|PINCODE|PIN|$)",
        # Just Hindi पता
        r"पता\s*/?([A-Z0-9,\.\s]{5,}?)(?=\n|PINCODE|PHONE|$)",
    ]

    text_normalized = text.strip()
    for pattern in patterns:
        match = re.search(pattern, text_normalized, re.IGNORECASE | re.DOTALL)
        if match:
            address = match.group(1).strip()
            address = " ".join(address.split())
            if len(address) > 5 and len(address) < 200:
                return address

    return None


def detect_pan(text):
    """Detect PAN card and extract details"""
    text_clean = text.replace(" ", "")
    match = re.search(r"[A-Z]{5}[0-9]{4}[A-Z]", text_clean)

    if match:
        pan_number = match.group()
        name = extract_name_from_text(text)
        return {
            "number": pan_number,
            "name": name
        }
    return None


def detect_aadhaar(text):
    """Detect Aadhaar and extract details - improved version"""

    # First check if it's likely an Aadhaar card by keywords
    aadhaar_keywords = ["AADHAAR", "AADHAR",
                        "आधार", "UIDAI", "UNIQUE IDENTIFICATION"]
    is_likely_aadhaar = any(keyword in text.upper()
                            for keyword in aadhaar_keywords)

    # Clean text - remove spaces and common OCR errors
    text_clean = text.replace(" ", "").replace("O", "0").replace("o", "0")
    text_clean = text_clean.replace(
        "I", "1").replace("l", "1").replace("|", "1")
    text_clean = text_clean.replace("S", "5").replace("B", "8")

    # Try multiple patterns for Aadhaar number
    patterns = [
        r"[2-9][0-9]{11}",  # Standard 12-digit starting with 2-9
        r"[2-9][0-9]{3}\s*[0-9]{4}\s*[0-9]{4}",  # With spaces: XXXX XXXX XXXX
    ]

    aadhaar_number = None

    # First try with cleaned text
    for pattern in patterns:
        match = re.search(pattern, text_clean)
        if match:
            aadhaar_number = re.sub(
                r"\s", "", match.group())  # Remove any spaces
            break

    # If not found, try original text with spaces pattern
    if not aadhaar_number:
        spaced_match = re.search(r"[2-9]\d{3}\s+\d{4}\s+\d{4}", text)
        if spaced_match:
            aadhaar_number = re.sub(r"\s", "", spaced_match.group())

    # Validate: Aadhaar should be exactly 12 digits and start with 2-9
    if aadhaar_number and len(aadhaar_number) == 12 and aadhaar_number[0] in "23456789":
        name = extract_name_from_text(text)
        address = extract_address_from_text(text)
        return {
            "number": aadhaar_number,
            "name": name,
            "address": address
        }

    # If we found Aadhaar keywords but no valid number, still try to extract
    if is_likely_aadhaar:
        # Try finding any 12-digit sequence
        all_digits = re.findall(r"\d+", text_clean)
        combined = "".join(all_digits)
        for i in range(len(combined) - 11):
            potential = combined[i:i+12]
            if potential[0] in "23456789":
                name = extract_name_from_text(text)
                address = extract_address_from_text(text)
                return {
                    "number": potential,
                    "name": name,
                    "address": address
                }

    return None


def detect_passport(text):
    """Detect Indian passport and extract details"""
    text_clean = text.replace(" ", "")
    match = re.search(r"[A-Z][0-9]{7}", text_clean)

    if match:
        passport_number = match.group()
        name = extract_name_from_text(text)
        return {
            "number": passport_number,
            "name": name
        }
    return None


def detect_cheque(text):
    """Detect if document is a cheque based on keywords"""
    keywords = ["CHEQUE", "CHECK", "PAY", "RUPEES", "BANK", "A/C NO", "IFSC"]
    text = text.upper()
    matches = sum(1 for keyword in keywords if keyword in text)
    # If 3 or more keywords match, likely a cheque
    return matches >= 3
