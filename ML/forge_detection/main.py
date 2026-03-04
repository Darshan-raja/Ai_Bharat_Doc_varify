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

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import google.generativeai as genai

from id_ocr import extract_text, detect_pan, detect_aadhaar, detect_passport, detect_cheque

# ================= ENV =================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in .env")

genai.configure(api_key=GEMINI_API_KEY)

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

    try:
        return json.loads(response.text.strip())
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", response.text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"error": "Please enter an educational certificate."}

# ================= API =================


@app.post("/extract")
async def extract_document(file: UploadFile = File(...)):

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    # Save image
    os.makedirs("uploads", exist_ok=True)
    image_path = f"uploads/{uuid.uuid4()}.png"
    with open(image_path, "wb") as f:
        f.write(image_bytes)

    # ================= ID OCR FIRST (PAN / AADHAAR / PASSPORT / CHEQUE) =================
    ocr_text = extract_text(image_path)

    print("====================================")
    print("OCR TEXT RAW:")
    print(ocr_text)
    print("====================================")

    # Check for PAN card
    pan = detect_pan(ocr_text)
    if pan:
        return JSONResponse(content={
            "document_type": "PAN",
            "PAN Number": pan["number"],
            "Name": pan["name"],
            "Date of Birth": None,
            "final_status": "AUTHENTIC",
            "message": "PAN card detected and verified"
        })

    # Check for Aadhaar card
    aadhaar = detect_aadhaar(ocr_text)
    if aadhaar:
        # Format Aadhaar number with spaces for readability
        formatted_aadhaar = f"{aadhaar['number'][:4]} {aadhaar['number'][4:8]} {aadhaar['number'][8:]}"
        return JSONResponse(content={
            "document_type": "AADHAAR",
            "Aadhaar Number": formatted_aadhaar,
            "Name": aadhaar["name"],
            "Address": aadhaar["address"],
            "final_status": "AUTHENTIC",
            "message": "Aadhaar card detected and verified"
        })

    # Check for Passport
    passport = detect_passport(ocr_text)
    if passport:
        return JSONResponse(content={
            "document_type": "PASSPORT",
            "Passport Number": passport["number"],
            "Name": passport["name"],
            "Date of Birth": None,
            "Date of Issue": None,
            "Date of Expiry": None,
            "final_status": "AUTHENTIC",
            "message": "Passport detected and verified"
        })

    # Check for Cheque
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
        # If we hit a rate limit, try falling back to local OCR for ID cards
        if data.get("is_rate_limit"):
            local_data = extract_with_local_ocr(image_path)
            if "error" not in local_data:
                data = local_data # Fallback succeeded!
            else:
                return JSONResponse(content=data) # Fallback failed, return rate limit error
        else:
            return JSONResponse(content=data)
        
    # ================= TAMPERING DETECTION =================
    # We run the image quality / tampering heuristics for ALL documents
    tamper_info = detect_pan_tampering(image_path)
    data.update(tamper_info)

    # Decide final status based on tampering score
    if tamper_info.get("tampering_result") == "SUSPICIOUS":
        data["final_status"] = "SUSPICIOUS"
        data["message"] = f"Document quality suspicious or tampered. Detected as {data.get('document_type')}."
    else:
        data["final_status"] = "AUTHENTIC"
        data["message"] = f"Authentic {data.get('document_type')} detected."

    return JSONResponse(content=data)
