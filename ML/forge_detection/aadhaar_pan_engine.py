def verify_id_document(cv_image):
    upscaled = smart_resize(cv_image)

    gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 3)

    qr_status = check_qr_advanced(upscaled)

    raw_text = reader.readtext(upscaled, detail=0)
    full_text = " ".join(raw_text)

    id_res = find_valid_ids(full_text)

    result = {
        "document_type": id_res["type"],
        "id_number": id_res["number"],
        "has_face": len(faces) > 0,
        "qr_present": qr_status["present"],
        "qr_method": qr_status["method"]
    }

    if id_res["type"] == "Aadhaar Card":
        if id_res["number"] and qr_status["present"]:
            result["final_status"] = "AUTHENTIC"
        else:
            result["final_status"] = "SUSPICIOUS"

    elif id_res["type"] == "PAN Card":
        result["final_status"] = "AUTHENTIC" if id_res["number"] else "SUSPICIOUS"

    else:
        result["final_status"] = "UNSUPPORTED"

    return result
