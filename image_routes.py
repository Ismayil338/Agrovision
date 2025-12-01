import os
import uuid
import json
import numpy as np
from PIL import Image as PILImage
from flask import Blueprint, request, render_template, redirect, url_for, session, abort, flash, jsonify
from werkzeug.utils import secure_filename
from models import db, Image, User
import tensorflow as tf

image_bp = Blueprint("image", __name__)
UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED = {"png", "jpg", "jpeg"}

MODEL_PATH = "models/agrovision_final.keras"
CLASS_NAMES_PATH = "models/class_names.json"

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    CLASS_NAMES = json.load(f)

def allowed_file(name):
    return "." in name and name.rsplit(".", 1)[1].lower() in ALLOWED

def predict_image(path):
    img = PILImage.open(path).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)

    preds = model.predict(arr, verbose=0)
    probs = preds[0]

    idx = int(np.argmax(probs))
    confidence = round(float(probs[idx]) * 100, 2)
    label = CLASS_NAMES[idx]

    return label, confidence

@image_bp.route("/<lang>/upload", methods=["GET", "POST"])
def upload(lang):
    if lang not in ["az", "en"]:
        abort(404)

    if "user_id" not in session:
        return redirect(url_for("login", lang=lang))

    if request.method == "POST":
        file = request.files.get("image")

        if not file or file.filename == "":
            flash("No image selected.")
            return redirect(request.url)

        if not allowed_file(file.filename):
            flash("Only png, jpg, jpeg allowed.")
            return redirect(request.url)

        fname = secure_filename(file.filename)
        unique = f"{uuid.uuid4().hex}_{fname}"
        path = os.path.join(UPLOAD_FOLDER, unique)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(path)

        label, conf = predict_image(path)

        img_record = Image(filename=unique, user_id=session["user_id"], prediction=label)
        db.session.add(img_record)
        db.session.commit()

        return render_template(f"{lang}/upload.html",
                               filename=unique,
                               prediction=label,
                               confidence=conf,
                               lang=lang)

    return render_template(f"{lang}/upload.html", filename=None, lang=lang)

@image_bp.route("/<lang>/my_images")
def my_images(lang):
    if "user_id" not in session:
        return redirect(url_for("login", lang=lang))

    user = User.query.get(session["user_id"])
    return render_template(f"{lang}/my_images.html", images=user.images, lang=lang)

@image_bp.route("/<lang>/delete/<fname>", methods=["POST"])
def delete(lang, fname):
    if "user_id" not in session:
        return redirect(url_for("login", lang=lang))

    img = Image.query.filter_by(filename=fname, user_id=session["user_id"]).first()
    if not img:
        abort(403)

    path = os.path.join(UPLOAD_FOLDER, fname)
    if os.path.exists(path):
        os.remove(path)

    db.session.delete(img)
    db.session.commit()
    return redirect(url_for("image.my_images", lang=lang))

@image_bp.route("/api/upload", methods=["POST"])
def api_upload():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Login required"}), 401

    file = request.files.get("image")
    if not file or file.filename == "":
        return jsonify({"success": False, "message": "No image"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Invalid format"}), 400

    fname = secure_filename(file.filename)
    unique = f"{uuid.uuid4().hex}_{fname}"
    path = os.path.join(UPLOAD_FOLDER, unique)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(path)

    label, conf = predict_image(path)

    img_record = Image(filename=unique, user_id=session["user_id"], prediction=label)
    db.session.add(img_record)
    db.session.commit()

    return jsonify({
        "success": True,
        "filename": unique,
        "prediction": label,
        "confidence": conf,
        "image_url": f"/static/uploads/{unique}"
    }), 200
