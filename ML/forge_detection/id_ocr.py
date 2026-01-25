import easyocr
import re

reader = easyocr.Reader(['en'], gpu=False)


def extract_text(image_path):
    results = reader.readtext(image_path, detail=0)
    return " ".join(results).upper()


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
    """Detect Aadhaar and extract details"""
    text_clean = text.replace(" ", "")
    match = re.search(r"[2-9][0-9]{11}", text_clean)

    if match:
        aadhaar_number = match.group()
        name = extract_name_from_text(text)
        address = extract_address_from_text(text)
        return {
            "number": aadhaar_number,
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
