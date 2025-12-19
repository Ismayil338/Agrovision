from flask import Flask, render_template, request, redirect, url_for, flash, abort, session, jsonify
from flask_cors import CORS
import os
from models import db, User
from image_routes import image_bp

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "fallback-secret")

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Enable CORS for API endpoints
CORS(app, supports_credentials=True)

# Initialize DB and register blueprints
db.init_app(app)
app.register_blueprint(image_bp)

# Expose request and session in all templates
@app.context_processor
def inject_request():
    return dict(request=request, session=session)

# Serve the SPA frontend
@app.route('/')
def home_redirect():
    return render_template('index.html')

# Dynamic page renderer
@app.route('/<lang>/<page>')
@app.route('/<lang>/', defaults={'page': 'index'})
def render_page(lang, page):
    if lang not in ['az', 'en']:
        abort(404)

    template_path = f"{lang}/{page}.html"
    if not os.path.exists(os.path.join('templates', template_path)):
        abort(404)

    return render_template(template_path, lang=lang, page=page)

MESSAGES = {
    'missing_fields': {
        'en': "Email and password are required.",
        'az': "E-poçt və şifrə tələb olunur."
    },
    'user_exists': {
        'en': "User already exists.",
        'az': "İstifadəçi artıq mövcuddur."
    },
    'signup_success': {
        'en': "Account created successfully! Please log in.",
        'az': "Hesab uğurla yaradıldı! Zəhmət olmasa daxil olun."
    },
    'email_not_found': {
        'en': "No account with this email exists. Create a new one.",
        'az': "Bu e-poçt ünvanı ilə hesab tapılmadı. Yeni bir hesab yaradın."
    },
    'wrong_password': {
        'en': "Incorrect password. Please try again.",
        'az': "Şifrə yanlışdır. Zəhmət olmasa yenidən cəhd edin."
    },
    'login_success': {
        'en': "Logged in successfully!",
        'az': "Uğurla daxil oldunuz!"
    },
    'logged_out': {
        'en': "Logged out.",
        'az': "Sistemdən çıxıldı."
    }
}

# Flash message helper
def flash_message(key, lang):
    category = 'success' if key in ['signup_success', 'login_success', 'logged_out'] else 'danger'
    flash(MESSAGES[key].get(lang, MESSAGES[key]['en']), category)

# Signup
@app.route('/<lang>/signup', methods=['GET', 'POST'])
def signup(lang):
    if lang not in ['az', 'en']:
        abort(404)

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash_message('missing_fields', lang)
            return redirect(request.url)

        if User.query.filter_by(email=email).first():
            flash_message('user_exists', lang)
            return redirect(request.url)

        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash_message('signup_success', lang)
        return redirect(url_for('login', lang=lang))

    return render_template(f"{lang}/signup.html", lang=lang, page='signup')

# Login
@app.route('/<lang>/login', methods=['GET', 'POST'])
def login(lang):
    if lang not in ['az', 'en']:
        abort(404)

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash_message('missing_fields', lang)
            return redirect(request.url)

        user = User.query.filter_by(email=email).first()

        if not user:
            flash_message('email_not_found', lang)
            return redirect(request.url)

        if not user.check_password(password):
            flash_message('wrong_password', lang)
            return redirect(request.url)

        session['user_id'] = user.id
        flash_message('login_success', lang)
        return redirect(url_for('image.upload_image', lang=lang))

    return render_template(f"{lang}/login.html", lang=lang, page='login')

# Logout
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash_message('logged_out', session.get('lang', 'en'))
    return redirect('/')

# API Routes for Frontend SPA
@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    lang = data.get('lang') or 'en'
    
    if not email or not password:
        return jsonify({'success': False, 'message': MESSAGES['missing_fields'].get(lang, MESSAGES['missing_fields']['en'])}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': MESSAGES['user_exists'].get(lang, MESSAGES['user_exists']['en'])}), 400
    
    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': MESSAGES['signup_success'].get(lang, MESSAGES['signup_success']['en'])}), 201

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    lang = data.get('lang') or 'en'
    
    if not email or not password:
        return jsonify({'success': False, 'message': MESSAGES['missing_fields'].get(lang, MESSAGES['missing_fields']['en'])}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'success': False, 'message': MESSAGES['email_not_found'].get(lang, MESSAGES['email_not_found']['en'])}), 401
    
    if not user.check_password(password):
        return jsonify({'success': False, 'message': MESSAGES['wrong_password'].get(lang, MESSAGES['wrong_password']['en'])}), 401
    
    session['user_id'] = user.id
    return jsonify({'success': True, 'message': MESSAGES['login_success'].get(lang, MESSAGES['login_success']['en']), 'user_id': user.id}), 200

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Logged out successfully.'}), 200

@app.route('/api/check-auth', methods=['GET'])
def api_check_auth():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({'authenticated': True, 'email': user.email}), 200
    return jsonify({'authenticated': False}), 200

# Run the app
if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    with app.app_context():
        db.create_all()

    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=False)


