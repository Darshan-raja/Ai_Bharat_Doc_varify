# # filename: app.py
# import base64
# import json
# import re
# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import uuid
# from pan_tampering import detect_pan_tampering
# import os
# import google.generativeai as genai
# from id_ocr import extract_text, detect_pan, detect_aadhaar


# # # ---------- CORS Setup ----------
# # # Development: allow all origins
# # # Production: restrict to trusted domains only
# # allow_origins = ["*"]  # ✅ allows all origins during development
# # # Example for production:
# # # allow_origins = [
# # #     "http://localhost:3000",    # Local frontend
# # #     "https://your-frontend-domain.com"  # Deployed frontend
# # # ]

# # # ---------- Load environment variables ----------
# # load_dotenv()
# # GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# # if not GEMINI_API_KEY:
# #     raise RuntimeError("GEMINI_API_KEY not set in .env")

# # genai.configure(api_key=GEMINI_API_KEY)

# # # ---------- FastAPI App ----------
# # app = FastAPI(
# #     title="Gemini OCR API",
# #     description="Extract certificate info from images",
# #     version="1.0"
# # )

# # # ---------- Add CORS Middleware ----------
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=allow_origins,
# #     allow_credentials=True,
# #     allow_methods=["*"],  # Allow all HTTP methods
# #     allow_headers=["*"],  # Allow all headers
# # )

# # # ---------- Core Function ----------


# # def extract_with_gemini(image_bytes: bytes):
# #     image_data = base64.b64encode(image_bytes).decode("utf-8")

# #     prompt = """
# # You are an expert OCR and information extraction system.
# # First, carefully check whether the given image is an educational marksheet or certificate
# # (i.e., it should clearly contain information like name, roll number, course, branch, grades,
# # or other educational details).

# # If it is NOT an educational certificate/marksheet (for example, a random photo, ID card,
# # bill, receipt, or unrelated document), return the following JSON exactly:

# # {
# #   "error": "Please enter an educational certificate."
# # }

# # If it IS an educational certificate/marksheet, extract the following fields:
# # - Name
# # - Roll Number
# # - Course
# # - Branch
# # - Year
# # - CGPA
# # - SGPA
# # - Certificate Id
# # - Institution
# # - Issue Date

# # Return the result STRICTLY as a valid JSON object with keys exactly as above.
# # If a field is missing in the image, set its value to null.
# # Do not add extra commentary or explanation.
# # Only return JSON.
# # """

# #     model = genai.GenerativeModel("gemini-2.5-flash")
# #     response = model.generate_content(
# #         contents=[
# #             {"role": "user", "parts": [
# #                 prompt, {"mime_type": "image/png", "data": image_data}]}
# #         ]
# #     )

# #     try:
# #         data = json.loads(response.text.strip())
# #     except json.JSONDecodeError:
# #         match = re.search(r"\{.*\}", response.text, re.DOTALL)
# #         if match:
# #             data = json.loads(match.group())
# #         else:
# #             data = {}

# #     return data


# # # ---------- API Endpoint ----------
# # @app.post("/extract/")
# # async def extract_certificate(file: UploadFile = File(...)):
# #     if not file.content_type.startswith("image/"):
# #         raise HTTPException(status_code=400, detail="File must be an image")
# #     image_bytes = await file.read()
# #     extracted_data = extract_with_gemini(image_bytes)
# #     return JSONResponse(content=extracted_data)
# import base64
# import json
# import re
# import os
# import uuid

# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# from aadhaar_pan_engine import verify_id_document


# import google.generativeai as genai
# from pan_tampering import detect_pan_tampering

# # ---------------- ENV ----------------
# load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# if not GEMINI_API_KEY:
#     raise RuntimeError("GEMINI_API_KEY not set in .env")

# genai.configure(api_key=GEMINI_API_KEY)

# # ---------------- APP ----------------
# app = FastAPI(
#     title="AI Bharat – Document Verification API",
#     description="OCR + PAN + Marksheet verification using Gemini and OpenCV",
#     version="1.0"
# )

# # ---------------- CORS ----------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:9080",
#         "http://127.0.0.1:9080",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ---------------- GEMINI OCR ----------------


# def extract_with_gemini(image_bytes: bytes):
#     image_data = base64.b64encode(image_bytes).decode("utf-8")

#     prompt = """
# You are an expert OCR and document classification system.

# First, identify the document type:
# - PAN Card
# - Educational Marksheet / Certificate
# - Other

# If the document is NOT a PAN card or Marksheet, return exactly:

# {
#   "error": "Unsupported document"
# }

# If the document is a PAN Card, extract:
# - Name
# - PAN Number
# - Date of Birth
# - document_type: "PAN"

# If the document is a Marksheet, extract:
# - Name
# - Roll Number
# - Course
# - Branch
# - Year
# - CGPA
# - SGPA
# - Certificate Id
# - Institution
# - Issue Date
# - document_type: "MARKSHEET"

# Return STRICT JSON only.
# If a field is missing, set it to null.
# Do NOT add explanations.
# """

#     model = genai.GenerativeModel("gemini-2.5-flash")
#     response = model.generate_content(
#         contents=[
#             {
#                 "role": "user",
#                 "parts": [
#                     prompt,
#                     {"mime_type": "image/png", "data": image_data}
#                 ]
#             }
#         ]
#     )

#     try:
#         return json.loads(response.text.strip())
#     except json.JSONDecodeError:
#         match = re.search(r"\{.*\}", response.text, re.DOTALL)
#         if match:
#             return json.loads(match.group())
#         return {}

# # ---------------- PAN RULE VERIFICATION ----------------


# def verify_pan_rules(data):
#     pan = data.get("PAN Number")

#     if not pan:
#         return "SUSPICIOUS"

#     if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan):
#         return "SUSPICIOUS"

#     return "AUTHENTIC"

# # ---------------- API ----------------


# @app.post("/extract")

# async def extract_document(file: UploadFile = File(...)):


#     if not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="File must be an image")

#     image_bytes = await file.read()

#     # Save image (needed for tampering detection)
#     os.makedirs("uploads", exist_ok=True)
#     image_path = f"uploads/{uuid.uuid4()}.png"

#     with open(image_path, "wb") as f:
#         f.write(image_bytes)

#     data = extract_with_gemini(image_bytes)

#     # If unsupported document
#     if "error" in data:
#         return JSONResponse(content=data)

#     # ---------------- PAN LOGIC ----------------
#     if data.get("document_type") == "PAN":

#         # Rule-based PAN verification
#         data["verification_result"] = verify_pan_rules(data)

#         # Image tampering detection
#         tamper = detect_pan_tampering(image_path)
#         data.update(tamper)

#         # Final decision
#         if (
#             data["verification_result"] == "SUSPICIOUS"
#             or data["tampering_result"] == "SUSPICIOUS"
#         ):
#             data["final_status"] = "SUSPICIOUS"
#         else:
#             data["final_status"] = "AUTHENTIC"

#     # ---------------- MARKSHEET ----------------
#     if data.get("document_type") == "MARKSHEET":
#         data["final_status"] = "EXTRACTED"

#     return JSONResponse(content=data)


# main.py
import os
import re
import uuid
import json
import base64
from datetime import datetime, date

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import google.generativeai as genai

from id_ocr import extract_text_and_confidence, detect_pan, detect_aadhaar, detect_passport, detect_cheque
from pan_tampering import detect_pan_tampering

# ================= ENV =================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in .env")

genai.configure(api_key=GEMINI_API_KEY)

# ================= API QUOTA TRACKING =================
DAILY_LIMIT = 20  # Free tier limit for gemini-2.5-flash
api_usage = {
    "date": str(date.today()),
    "count": 0
}

AUTH_SCORE_MAX = 0.3
SUSPICIOUS_SCORE_MAX = 0.7
OCR_CONFIDENCE_MIN = 0.25
OCR_CONFIDENCE_HARD_FAIL = 0.10
RATE_LIMIT_RETRY_SECONDS = 20


def get_quota_status():
    """Get current API quota status"""
    # Reset counter if it's a new day
    if api_usage["date"] != str(date.today()):
        api_usage["date"] = str(date.today())
        api_usage["count"] = 0

    remaining = DAILY_LIMIT - api_usage["count"]
    return {
        "daily_limit": DAILY_LIMIT,
        "used": api_usage["count"],
        "remaining": max(0, remaining),
        "is_exhausted": remaining <= 0,
        "warning": remaining <= 5 and remaining > 0
    }


def increment_usage():
    """Increment API usage counter"""
    if api_usage["date"] != str(date.today()):
        api_usage["date"] = str(date.today())
        api_usage["count"] = 0
    api_usage["count"] += 1


def is_rate_limit_error(message: str) -> bool:
    msg = _safe_str(message).lower()
    return any(token in msg for token in ["quota", "rate limit", "429", "resource exhausted"])


def build_rate_limit_response(message: str = "API limit exceeded"):
    return {
        "error_type": "RATE_LIMIT",
        "error": "RATE_LIMIT",
        "final_status": "PENDING",
        "message": message,
        "retry_after_seconds": RATE_LIMIT_RETRY_SECONDS,
    }


def _safe_str(value):
    if value is None:
        return ""
    return str(value).strip()


def _digits_only(value):
    return re.sub(r"\D", "", _safe_str(value))


def normalize_document_type(value):
    doc_type = _safe_str(value).upper().replace("-", " ").replace("_", " ")
    doc_type = " ".join(doc_type.split())

    alias_map = {
        "AADHAR": "AADHAAR",
        "ADHAAR": "AADHAAR",
        "AADHAR CARD": "AADHAAR",
        "AADHAAR CARD": "AADHAAR",
        "PAN CARD": "PAN",
        "PASSPORT CARD": "PASSPORT",
        "MARKSHEET": "MARKSHEET",
        "MARK SHEET": "MARKSHEET",
        "MARKCARD": "MARKSHEET",
        "MARK CARD": "MARKSHEET",
        "MARKSCARD": "MARKSHEET",
        "MARKS CARD": "MARKSHEET",
        "MARKSHEET CERTIFICATE": "MARKSHEET",
        "EDUCATIONAL CERTIFICATE": "MARKSHEET",
    }

    if doc_type in alias_map:
        return alias_map[doc_type]

    return doc_type


def _contains_any(text, keywords):
    text_u = _safe_str(text).upper()
    return any(keyword in text_u for keyword in keywords)


def validate_document_fields(data, source_text=""):
    """Return validation state: VALID, PARTIAL, or INVALID."""
    doc_type = normalize_document_type(data.get("document_type"))

    if doc_type == "PAN":
        pan_number = _safe_str(data.get("PAN Number")).upper()
        name = _safe_str(data.get("Name"))
        if not pan_number:
            return "INVALID", "PAN number missing"
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan_number):
            return "INVALID", "Invalid PAN format"
        if not name:
            return "PARTIAL", "PAN number valid but name missing"
        return "VALID", "Valid PAN data"

    if doc_type == "AADHAAR":
        aadhaar_number = _digits_only(data.get("Aadhaar Number"))
        name = _safe_str(data.get("Name"))
        dob = _safe_str(data.get("Date of Birth"))

        joined_signals = " ".join([
            _safe_str(source_text),
            _safe_str(data.get("Name")),
            _safe_str(data.get("document_type")),
            _safe_str(data.get("Gender")),
            _safe_str(data.get("message")),
        ])

        aadhaar_anchors = [
            "AADHAAR", "AADHAR", "UIDAI", "GOVERNMENT OF INDIA", "GOVT OF INDIA", "INDIA"
        ]
        foreign_markers = [
            "REPUBLIC OF", "KENYA", "NATIONAL ID", "IDENTITY CARD", "PASSPORT NO"
        ]

        if not aadhaar_number:
            return "INVALID", "Aadhaar number missing"
        if not re.match(r"^[0-9]{12}$", aadhaar_number):
            return "INVALID", "Invalid Aadhaar format"
        if _contains_any(joined_signals, foreign_markers) and not _contains_any(joined_signals, aadhaar_anchors):
            return "INVALID", "Non-Aadhaar ID detected"
        if not _contains_any(joined_signals, aadhaar_anchors):
            return "PARTIAL", "Aadhaar number found but card anchors are weak"
        if not name or not dob:
            return "PARTIAL", "Aadhaar number valid but profile fields are incomplete"
        return "VALID", "Valid Aadhaar data"

    if doc_type == "PASSPORT":
        passport_number = _safe_str(data.get("Passport Number")).upper()
        name = _safe_str(data.get("Name"))
        dob = _safe_str(data.get("Date of Birth"))
        if not passport_number:
            return "INVALID", "Passport number missing"
        if not re.match(r"^[A-Z][0-9]{7}$", passport_number):
            return "INVALID", "Invalid passport format"
        if not name or not dob:
            return "PARTIAL", "Passport number valid but profile fields are incomplete"
        return "VALID", "Valid passport data"

    if doc_type == "MARKSHEET":
        key_fields = ["Name", "Roll Number", "Institution", "Course", "Year"]
        present = [field for field in key_fields if _safe_str(data.get(field))]
        if len(present) >= 3:
            return "VALID", "Marksheet fields look consistent"
        if len(present) >= 1:
            return "PARTIAL", "Marksheet partially extracted"
        return "INVALID", "Marksheet data could not be extracted"

    return "INVALID", "Unsupported document type"


def evaluate_final_status(data, tamper_info, ocr_confidence, source_text=""):
    data["document_type"] = normalize_document_type(data.get("document_type"))

    tampering_score = float(tamper_info.get("tampering_score", 1.0))
    tampering_score = max(0.0, min(1.0, tampering_score))

    if ocr_confidence < OCR_CONFIDENCE_HARD_FAIL:
        return {
            "final_status": "SUSPICIOUS",
            "reason": "Low OCR confidence",
            "model_score": tampering_score,
            "message": "Document image is unreadable. Please upload a clearer image."
        }

    validation_state, reason = validate_document_fields(data, source_text)

    if validation_state == "INVALID":
        return {
            "final_status": "FAKE",
            "reason": reason,
            "model_score": 0.0,
            "message": "Document rejected due to invalid or incomplete data."
        }

    if ocr_confidence < OCR_CONFIDENCE_MIN or validation_state == "PARTIAL":
        return {
            "final_status": "SUSPICIOUS",
            "reason": "Low OCR confidence or partial extraction",
            "model_score": tampering_score,
            "message": "Document detected, but quality/extraction is incomplete. Please re-upload a clearer image."
        }

    if tampering_score < AUTH_SCORE_MAX:
        return {
            "final_status": "AUTHENTIC",
            "reason": "Model score and rule checks passed",
            "model_score": tampering_score,
            "message": f"Authentic {data.get('document_type')} detected."
        }

    if tampering_score < SUSPICIOUS_SCORE_MAX:
        return {
            "final_status": "SUSPICIOUS",
            "reason": "Tampering score is in suspicious range",
            "model_score": tampering_score,
            "message": "Document appears suspicious and needs manual review."
        }

    return {
        "final_status": "FAKE",
        "reason": "Tampering score in fake range",
        "model_score": tampering_score,
        "message": "Document rejected because tampering indicators are high."
    }


# ================= APP =================
app = FastAPI(
    title="AI Bharat – Document Verification API",
    description="PAN, Aadhaar, and Marksheet verification",
    version="1.0"
)

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:9080",
        "http://127.0.0.1:9080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= GEMINI OCR (MARKSHEET ONLY) =================


def extract_with_gemini(image_bytes: bytes):
    image_data = base64.b64encode(image_bytes).decode("utf-8")

    prompt = """
You are an expert OCR and document classification system for Indian IDs and educational certificates.

First, strictly identify the document type from one of the following:
- "PAN"
- "AADHAAR"
- "PASSPORT"
- "MARKSHEET"

If the document type is NOT one of the above (e.g. random photos, non-document images, etc), return exactly:
{ "error": "Please enter a valid PAN, Aadhaar, Passport, or Marksheet document." }

If the document is a "PAN", extract:
- "document_type": "PAN"
- "Name"
- "PAN Number"
- "Date of Birth"

If the document is an "AADHAAR", extract:
- "document_type": "AADHAAR"
- "Name"
- "Aadhaar Number" (format with spaces like: 1234 5678 9012)
- "Date of Birth"
- "Gender"

If the document is a "PASSPORT", extract:
- "document_type": "PASSPORT"
- "Name" (Given Name + Surname)
- "Passport Number"
- "Date of Birth"
- "Date of Issue"
- "Date of Expiry"

If the document is a "MARKSHEET" or educational certificate, extract:
- "document_type": "MARKSHEET"
- "Name"
- "Roll Number"
- "Course"
- "Branch"
- "Year"
- "CGPA"
- "SGPA"
- "Certificate Id"
- "Institution"
- "Issue Date"

Return STRICT JSON only. If a field is missing, set it to null.
"""

    model = genai.GenerativeModel("gemini-2.5-flash")

    try:
        response = model.generate_content(
            contents=[
                {
                    "role": "user",
                    "parts": [
                        prompt,
                        {"mime_type": "image/png", "data": image_data}
                    ]
                }
            ]
        )
    except Exception as e:
        error_message = str(e)
        print(f"Gemini API Error: {error_message}")
        if is_rate_limit_error(error_message):
            return build_rate_limit_response("API limit exceeded")
        return {
            "error": "OCR_API_ERROR",
            "final_status": "PENDING",
            "message": f"OCR API error: {error_message}",
        }

    try:
        return json.loads(response.text.strip())
    except Exception:
        match = re.search(r"\{.*\}", response.text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
        return {"error": "Please enter an educational certificate. OCR failed to parse structure."}

# ================= API =================


@app.get("/ocr/quota")
async def get_api_quota():
    """Check API quota status before uploading"""
    return JSONResponse(content=get_quota_status())


@app.post("/ocr/extract")
async def extract_document(file: UploadFile = File(...)):

    # Check quota before processing
    quota = get_quota_status()
    if quota["is_exhausted"]:
        safe_response = build_rate_limit_response(
            f"Daily limit of {DAILY_LIMIT} requests reached. Please wait and retry."
        )
        safe_response["quota"] = quota
        return JSONResponse(
            status_code=429,
            content=safe_response
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    # Save image
    os.makedirs("uploads", exist_ok=True)
    image_path = f"uploads/{uuid.uuid4()}.png"
    with open(image_path, "wb") as f:
        f.write(image_bytes)

    # ================= ID OCR FIRST (PAN / AADHAAR / PASSPORT / CHEQUE) =================
    ocr_text, ocr_confidence = extract_text_and_confidence(image_path)

    print("====================================")
    print("OCR TEXT RAW:")
    print(ocr_text)
    print("====================================")

    # Check for PAN card (use local OCR only for PAN - it works well)
    pan = detect_pan(ocr_text)
    if pan:
        # For PAN, also run tampering detection
        tamper_info = detect_pan_tampering(image_path)
        response_data = {
            "document_type": "PAN",
            "PAN Number": pan["number"],
            "Name": pan["name"],
            "Date of Birth": None,
            "ocr_confidence": round(ocr_confidence, 3),
            "tampering_result": tamper_info.get("tampering_result"),
            "tampering_score": tamper_info.get("tampering_score"),
        }
        response_data.update(evaluate_final_status(
            response_data, tamper_info, ocr_confidence, ocr_text))
        return JSONResponse(content=response_data)

    # For Aadhaar, Passport, and other documents - use Gemini for better accuracy
    # (Local OCR gives incomplete name and sometimes wrong numbers)

    # Check for Cheque only (simple keyword detection is enough)
    is_cheque = detect_cheque(ocr_text)
    if is_cheque:
        return JSONResponse(content={
            "document_type": "CHEQUE",
            "Bank Name": None,
            "Account Number": None,
            "IFSC Code": None,
            "Cheque Number": None,
            "final_status": "DETECTED",
            "message": "Cheque/Check detected"
        })

    # ================= GEMINI FOR MARKSHEET =================
    data = extract_with_gemini(image_bytes)

    if "error" in data:
        if data.get("error") == "RATE_LIMIT" or data.get("error_type") == "RATE_LIMIT":
            return JSONResponse(status_code=429, content=data)
        return JSONResponse(content=data)

    increment_usage()  # Track only successful Gemini calls

    # ================= TAMPERING DETECTION =================
    # We run the image quality / tampering heuristics for ALL documents
    tamper_info = detect_pan_tampering(image_path)
    data.update(tamper_info)

    data["ocr_confidence"] = round(ocr_confidence, 3)
    data.update(evaluate_final_status(
        data, tamper_info, ocr_confidence, ocr_text))

    return JSONResponse(content=data)
