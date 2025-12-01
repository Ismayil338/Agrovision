import os
import uuid
import json
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

MODEL_DIR = 'model'
MODEL_CANDIDATES = ['agrovision_final.keras', 'agrovision_best.keras', 'agrovision.h5']
MODEL_PATH = None
for name in MODEL_CANDIDATES:
    candidate = os.path.join(MODEL_DIR, name)
    if os.path.exists(candidate):
        MODEL_PATH = candidate
        break

model = None
if tf is not None and MODEL_PATH is not None:
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {str(e)}. Image prediction will be disabled.")
elif tf is None:
    print("TensorFlow not available. Image prediction will be disabled.")
else:
    print("Model file not found. Image prediction will be disabled.")

CLASS_NAMES = []
class_names_path = os.path.join(MODEL_DIR, 'class_names.json')
if os.path.exists(class_names_path):
    try:
        with open(class_names_path, 'r', encoding='utf-8') as f:
            CLASS_NAMES = json.load(f)
    except Exception:
        CLASS_NAMES = []

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

            predicted_label = None
            try:
                if model is None or np is None:
                    predicted_label = "Model not available"
                else:
                    img = PILImage.open(upload_path).convert('RGB')
                    img = img.resize((224, 224))
                    img_array = np.array(img) / 255.0
                    img_array = np.expand_dims(img_array, axis=0)

                    prediction = model.predict(img_array, verbose=0)
                    if prediction is None or len(prediction.shape) != 2 or prediction.shape[0] < 1:
                        predicted_label = "Prediction failed"
                    elif prediction.shape[1] == 1:
                        if len(CLASS_NAMES) >= 2:
                            predicted_label = CLASS_NAMES[1] if float(prediction[0][0]) > 0.5 else CLASS_NAMES[0]
                        else:
                            predicted_label = "Unknown"
                    else:
                        idx = int(np.argmax(prediction[0]))
                        if 0 <= idx < len(CLASS_NAMES):
                            predicted_label = CLASS_NAMES[idx]
                        else:
                            predicted_label = "Unknown"
            except Exception as e:
                flash(f"Error during prediction: {str(e)}", "danger")
                return redirect(request.url)

            flash(msg['success'])
            return render_template(f"{lang}/upload.html", filename=unique_name, lang=lang, prediction=predicted_label)

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

        predicted_label = "Unknown"
        confidence = 0.0
        try:
            if model is None or np is None:
                predicted_label = "Model not available"
            else:
                img = PILImage.open(upload_path).convert('RGB')
                img = img.resize((224, 224))
                img_array = np.array(img) / 255.0
                img_array = np.expand_dims(img_array, axis=0)

                prediction = model.predict(img_array, verbose=0)
                if prediction is None or len(prediction.shape) != 2 or prediction.shape[0] < 1:
                    predicted_label = "Prediction failed"
                elif prediction.shape[1] == 1:
                    confidence = float(prediction[0][0])
                    if len(CLASS_NAMES) >= 2:
                        predicted_label = CLASS_NAMES[1] if confidence > 0.5 else CLASS_NAMES[0]
                    else:
                        predicted_label = "Unknown"
                else:
                    predicted_idx = int(np.argmax(prediction[0]))
                    confidence = float(prediction[0][predicted_idx])
                    if 0 <= predicted_idx < len(CLASS_NAMES):
                        predicted_label = CLASS_NAMES[predicted_idx]
                    else:
                        predicted_label = "Unknown"
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            predicted_label = f"Error: {str(e)}"

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
