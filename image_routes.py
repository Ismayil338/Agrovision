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

# Load the trained model (.h5)
MODEL_PATH = os.path.join('model', 'agrovision.h5')
model = None
if tf is not None:
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Model loaded successfully from {MODEL_PATH}")
        else:
            print(f"Warning: Model file not found at {MODEL_PATH}. Image prediction will be disabled.")
    except Exception as e:
        print(f"Error loading model: {str(e)}. Image prediction will be disabled.")
else:
    print("TensorFlow not available. Image prediction will be disabled.")

# Optional: class labels if your model uses them
CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight',
    'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 'Tomato___Early_blight',
    'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
]
  # Update based on your model output

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

            # ✅ Predict using the model
            try:
                img = PILImage.open(upload_path).convert('RGB')
                img = img.resize((224, 224))  # Modelin gözlədiyi ölçü
                img_array = np.array(img) / 255.0
                img_array = np.expand_dims(img_array, axis=0)

                prediction = model.predict(img_array)
                print("Prediction output:", prediction)
                print("Prediction shape:", prediction.shape)

                # Əgər prediction cavabı boşdursa
                if prediction is None or prediction.shape[1] == 0:
                    predicted_label = "Prediction failed (empty output)"
                elif prediction.shape[1] == 1:  # Binary classification (sigmoid)
                    predicted_label = CLASS_NAMES[1] if prediction[0][0] > 0.5 else CLASS_NAMES[0]
                else:  # Multi-class (softmax)
                    predicted_label = CLASS_NAMES[np.argmax(prediction[0])]


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

        # Predict using the model
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
                
                if prediction is None or prediction.shape[1] == 0:
                    predicted_label = "Prediction failed"
                elif prediction.shape[1] == 1:
                    confidence = float(prediction[0][0])
                    predicted_label = CLASS_NAMES[1] if confidence > 0.5 else CLASS_NAMES[0]
                else:
                    predicted_idx = np.argmax(prediction[0])
                    confidence = float(prediction[0][predicted_idx])
                    predicted_label = CLASS_NAMES[predicted_idx]
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
