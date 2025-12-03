import json
import os
import uuid
from PIL import Image as PILImage
from flask import Blueprint, request, render_template, redirect, url_for, session, abort, flash, jsonify
from werkzeug.utils import secure_filename
from models import db, Image, User

# Optional ML dependencies
try:
    import numpy as np
except Exception:
    np = None
try:
    import tensorflow as tf
except Exception:
    tf = None

image_bp = Blueprint('image', __name__)
UPLOAD_FOLDER = os.path.join('static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MODEL_LOCATIONS = ['model', 'models']
MODEL_CANDIDATES = ['agrovision_final.keras', 'agrovision_best.keras', 'agrovision.h5']
UNKNOWN_LABEL = "Unknown"
UNKNOWN_CONFIDENCE_THRESHOLD = 0.5
CLASS_NAMES_FALLBACK = [
    "Corn_Blight",
    "Corn_Common_Rust",
    "Corn_Gray_Leaf_Spot",
    "Corn_Healthy",
    "Cucumber_Downy_mildew",
    "Cucumber_Healthy_leaves",
    "Cucumber_Powdery_mildew",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy",
    "Wheat_Healthy",
    "Wheat_diseased",
]


def _load_model():
    if tf is None:
        print("TensorFlow not available. Image prediction will be disabled.")
        return None, None

    for directory in MODEL_LOCATIONS:
        for candidate in MODEL_CANDIDATES:
            candidate_path = os.path.join(directory, candidate)
            if os.path.exists(candidate_path):
                try:
                    loaded_model = tf.keras.models.load_model(candidate_path)
                    print(f"Model loaded successfully from {candidate_path}")
                    return loaded_model, candidate_path
                except Exception as exc:
                    print(f"Error loading model at {candidate_path}: {exc}. Trying next candidate.")
    print("Warning: No trained model file found. Image prediction will be disabled.")
    return None, None


def _load_class_names(model_path):
    candidate_paths = []
    if model_path:
        candidate_paths.append(os.path.join(os.path.dirname(model_path), 'class_names.json'))
    for directory in MODEL_LOCATIONS:
        candidate_paths.append(os.path.join(directory, 'class_names.json'))

    for path in candidate_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as fh:
                    names = json.load(fh)
                if isinstance(names, list) and names:
                    print(f"Loaded {len(names)} class names from {path}")
                    return names
                print(f"{path} is empty or malformed. Trying next candidate.")
            except Exception as exc:
                print(f"Failed to load class names from {path}: {exc}. Trying next candidate.")
    return CLASS_NAMES_FALLBACK


model, MODEL_PATH = _load_model()
CLASS_NAMES = _load_class_names(MODEL_PATH)


def run_prediction(image_path):
    if model is None:
        raise RuntimeError("Model not loaded.")
    if np is None:
        raise RuntimeError("NumPy not available.")

    img = PILImage.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array, verbose=0)
    if prediction.ndim == 1:
        prediction = np.expand_dims(prediction, axis=0)

    num_outputs = prediction.shape[1] if prediction.ndim > 1 else 1

    if num_outputs == 1:
        confidence = float(prediction[0][0])
        predicted_idx = int(confidence > 0.5)
        label_options = CLASS_NAMES if len(CLASS_NAMES) >= 2 else ["Class_0", "Class_1"]
        predicted_label = label_options[predicted_idx]
        confidence = confidence if predicted_idx == 1 else 1.0 - confidence
    else:
        predicted_idx = int(np.argmax(prediction[0]))
        confidence = float(prediction[0][predicted_idx])
        if len(CLASS_NAMES) != num_outputs:
            print(
                f"Warning: CLASS_NAMES length ({len(CLASS_NAMES)}) does not match model outputs ({num_outputs})."
            )
        label_options = CLASS_NAMES if len(CLASS_NAMES) == num_outputs else [f"Class_{i}" for i in range(num_outputs)]
        predicted_label = label_options[predicted_idx]

    final_label = predicted_label if confidence >= UNKNOWN_CONFIDENCE_THRESHOLD else UNKNOWN_LABEL
    return final_label, confidence

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@image_bp.route('/<lang>/upload', methods=['GET', 'POST'])
def upload_image(lang):
    if lang not in ['az', 'en']:
        abort(404)

    user_id = session.get('user_id')
    if not user_id:
        flash("You must be logged in to upload.")
        return redirect(url_for('login', lang=lang))

    messages = {
        'az': {
            'no_image': 'Şəkil seçilməyib.',
            'no_file': 'Fayl seçilməyib.',
            'wrong_format': 'Yalnız png, jpg, jpeg və gif formatları qəbul olunur.',
            'success': 'Şəkil uğurla yükləndi.'
        },
        'en': {
            'no_image': 'No image selected.',
            'no_file': 'No file selected.',
            'wrong_format': 'Only png, jpg, jpeg and gif files are allowed.',
            'success': 'Image successfully uploaded.'
        }
    }

    msg = messages[lang]

    if request.method == 'POST':
        if 'image' not in request.files:
            flash(msg['no_image'])
            return redirect(request.url)

        file = request.files['image']
        if file.filename == '':
            flash(msg['no_file'])
            return redirect(request.url)

        if file and allowed_file(file.filename):
            original_filename = secure_filename(file.filename)
            unique_name = f"{uuid.uuid4().hex}_{original_filename}"
            upload_path = os.path.join(UPLOAD_FOLDER, unique_name)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(upload_path)

            # Save record in DB
            new_image = Image(filename=unique_name, user_id=user_id)
            db.session.add(new_image)
            db.session.commit()

            try:
                predicted_label, confidence = run_prediction(upload_path)
            except Exception as e:
                flash(f"Error during prediction: {str(e)}", "danger")
                return redirect(request.url)

            flash(msg['success'])
            return render_template(
                f"{lang}/upload.html",
                filename=unique_name,
                lang=lang,
                prediction=predicted_label,
                confidence=round(confidence * 100, 2),
            )

        flash(msg['wrong_format'])
        return redirect(request.url)

    return render_template(f"{lang}/upload.html", filename=None, lang=lang)

@image_bp.route('/<lang>/my_images')
def my_images(lang):
    if lang not in ['az', 'en']:
        abort(404)

    user_id = session.get('user_id')
    if not user_id:
        flash("Please log in to see your images.")
        return redirect(url_for('login', lang=lang))

    user = User.query.get(user_id)
    return render_template(f"{lang}/my_images.html", images=user.images, lang=lang)

@image_bp.route('/<lang>/delete/<filename>', methods=['POST'])
def delete_image(lang, filename):
    if lang not in ['az', 'en']:
        abort(404)

    user_id = session.get('user_id')
    if not user_id:
        flash("Please log in.")
        return redirect(url_for('login', lang=lang))

    image = Image.query.filter_by(filename=filename, user_id=user_id).first()
    if not image:
        abort(403)

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(image)
    db.session.commit()

    flash("Image deleted successfully.")
    return redirect(url_for('image.my_images', lang=lang))

@image_bp.route('/display/<filename>')
def display_image(filename):
    user_id = session.get('user_id')
    if not user_id:
        flash("Please log in.")
        return redirect(url_for('login', lang='en'))

    image = Image.query.filter_by(filename=filename, user_id=user_id).first()
    if not image:
        abort(403)

    return redirect(url_for('static', filename='uploads/' + filename), code=301)

# API Routes for Frontend SPA
@image_bp.route('/api/upload', methods=['POST'])
def api_upload_image():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'You must be logged in to upload.'}), 401

    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image selected.'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected.'}), 400

    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{original_filename}"
        upload_path = os.path.join(UPLOAD_FOLDER, unique_name)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(upload_path)

        # Predict using the model
        try:
            predicted_label, confidence = run_prediction(upload_path)
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            predicted_label = f"Error: {str(e)}"
            confidence = 0.0

        # Save record in DB
        new_image = Image(filename=unique_name, user_id=user_id, prediction=predicted_label)
        db.session.add(new_image)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Image successfully uploaded.',
            'filename': unique_name,
            'prediction': predicted_label,
            'confidence': round(confidence * 100, 2),
            'image_url': f'/static/uploads/{unique_name}'
        }), 200

    return jsonify({'success': False, 'message': 'Only png, jpg, jpeg and gif files are allowed.'}), 400

@image_bp.route('/api/my-images', methods=['GET'])
def api_my_images():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Please log in to see your images.'}), 401

    user = User.query.get(user_id)
    images = []
    for img in user.images:
        images.append({
            'id': img.id,
            'filename': img.filename,
            'prediction': img.prediction if hasattr(img, 'prediction') else 'Unknown',
            'image_url': f'/static/uploads/{img.filename}',
            'created_at': img.created_at.isoformat() if hasattr(img, 'created_at') else None
        })
    
    return jsonify({'success': True, 'images': images}), 200

@image_bp.route('/api/delete/<filename>', methods=['DELETE'])
def api_delete_image(filename):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Please log in.'}), 401

    image = Image.query.filter_by(filename=filename, user_id=user_id).first()
    if not image:
        return jsonify({'success': False, 'message': 'Image not found.'}), 404

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(image)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Image deleted successfully.'}), 200
