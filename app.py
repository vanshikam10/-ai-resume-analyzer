from flask import Flask, render_template, request, jsonify
import os
import re
import json
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max
app.secret_key = 'resume-analyzer-secret-key'

ALLOWED_EXTENSIONS = {'pdf'}

# ── Skill categories ──────────────────────────────────────────────────────────
SKILL_CATEGORIES = {
    "Programming Languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "c", "go",
        "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab",
        "dart", "perl", "haskell", "lua"
    ],
    "Web Technologies": [
        "html", "css", "react", "angular", "vue", "nextjs", "nodejs", "express",
        "django", "flask", "fastapi", "spring", "laravel", "tailwind", "bootstrap",
        "jquery", "graphql", "rest", "api", "sass", "webpack", "vite"
    ],
    "Databases": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
        "cassandra", "dynamodb", "firebase", "elasticsearch", "neo4j", "mariadb"
    ],
    "AI / ML / Data": [
        "machine learning", "deep learning", "nlp", "natural language processing",
        "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
        "pandas", "numpy", "matplotlib", "seaborn", "opencv", "huggingface",
        "transformers", "llm", "data science", "data analysis", "neural network",
        "reinforcement learning", "bert", "gpt", "langchain"
    ],
    "DevOps & Cloud": [
        "docker", "kubernetes", "aws", "azure", "gcp", "google cloud", "ci/cd",
        "jenkins", "github actions", "terraform", "ansible", "linux", "bash",
        "shell scripting", "nginx", "apache", "microservices", "serverless"
    ],
    "Tools & Version Control": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence", "figma",
        "postman", "vs code", "visual studio", "intellij", "jupyter", "colab",
        "agile", "scrum", "kanban"
    ],
    "Soft Skills": [
        "communication", "leadership", "teamwork", "problem solving", "critical thinking",
        "time management", "adaptability", "creativity", "collaboration", "presentation"
    ]
}

ALL_SKILLS = []
for skills in SKILL_CATEGORIES.values():
    ALL_SKILLS.extend(skills)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(filepath):
    """Extract text from PDF using PyPDF2."""
    try:
        import PyPDF2
        text = ""
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"


def extract_skills(text):
    """Extract skills from text using keyword matching."""
    text_lower = text.lower()
    found = {}

    for category, skills in SKILL_CATEGORIES.items():
        category_skills = []
        for skill in skills:
            # word boundary matching
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                category_skills.append(skill)
        if category_skills:
            found[category] = category_skills

    return found


def extract_contact_info(text):
    """Extract basic contact information."""
    info = {}

    # Email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    if emails:
        info['email'] = emails[0]

    # Phone
    phone_pattern = r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
    phones = re.findall(phone_pattern, text)
    if phones:
        info['phone'] = phones[0]

    # LinkedIn
    linkedin_pattern = r'linkedin\.com/in/[\w-]+'
    linkedin = re.findall(linkedin_pattern, text.lower())
    if linkedin:
        info['linkedin'] = linkedin[0]

    # GitHub
    github_pattern = r'github\.com/[\w-]+'
    github = re.findall(github_pattern, text.lower())
    if github:
        info['github'] = github[0]

    return info


def calculate_match(resume_skills_flat, jd_text):
    """Calculate match % between resume and job description."""
    jd_lower = jd_text.lower()
    jd_skills = []

    for skill in ALL_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, jd_lower):
            jd_skills.append(skill)

    if not jd_skills:
        return 0, [], []

    matched = [s for s in jd_skills if s in resume_skills_flat]
    missing = [s for s in jd_skills if s not in resume_skills_flat]

    percentage = round((len(matched) / len(jd_skills)) * 100, 1)
    return percentage, matched, missing


def generate_feedback(percentage, matched, missing, resume_skills):
    """Generate actionable feedback."""
    feedback = []

    if percentage >= 80:
        feedback.append({
            "type": "success",
            "icon": "🎯",
            "title": "Excellent Match!",
            "text": "Your resume strongly aligns with the job description. Focus on tailoring your experience bullets."
        })
    elif percentage >= 60:
        feedback.append({
            "type": "warning",
            "icon": "📈",
            "title": "Good Match",
            "text": "Solid foundation! Add the missing skills to boost your chances significantly."
        })
    elif percentage >= 40:
        feedback.append({
            "type": "info",
            "icon": "🔧",
            "title": "Moderate Match",
            "text": "You have relevant skills but need to bridge some gaps. Consider learning the missing technologies."
        })
    else:
        feedback.append({
            "type": "error",
            "icon": "🚀",
            "title": "Needs Improvement",
            "text": "Significant skill gaps detected. Consider upskilling before applying to this specific role."
        })

    if missing:
        top_missing = missing[:5]
        feedback.append({
            "type": "info",
            "icon": "💡",
            "title": "Top Skills to Add",
            "text": f"Consider adding: {', '.join(top_missing)}"
        })

    total_skills = sum(len(v) for v in resume_skills.values())
    if total_skills > 15:
        feedback.append({
            "type": "success",
            "icon": "⭐",
            "title": "Strong Skill Portfolio",
            "text": f"You have {total_skills} skills listed — a competitive profile."
        })
    elif total_skills < 8:
        feedback.append({
            "type": "warning",
            "icon": "📝",
            "title": "Expand Your Skillset",
            "text": "List more technical skills and tools you've used in projects."
        })

    return feedback


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file uploaded'}), 400

    file = request.files['resume']
    jd_text = request.form.get('job_description', '').strip()

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF files are supported'}), 400

    if not jd_text:
        return jsonify({'error': 'Please paste a job description'}), 400

    # Save file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Extract text
    resume_text = extract_text_from_pdf(filepath)

    if not resume_text or len(resume_text) < 50:
        return jsonify({'error': 'Could not extract text from PDF. Make sure it\'s not a scanned image.'}), 400

    # Analysis
    resume_skills = extract_skills(resume_text)
    contact_info = extract_contact_info(resume_text)

    resume_skills_flat = []
    for skills in resume_skills.values():
        resume_skills_flat.extend(skills)

    match_percentage, matched_skills, missing_skills = calculate_match(resume_skills_flat, jd_text)
    feedback = generate_feedback(match_percentage, matched_skills, missing_skills, resume_skills)

    # Clean up uploaded file
    os.remove(filepath)

    return jsonify({
        'match_percentage': match_percentage,
        'resume_skills': resume_skills,
        'contact_info': contact_info,
        'matched_skills': matched_skills,
        'missing_skills': missing_skills[:10],
        'feedback': feedback,
        'total_resume_skills': len(resume_skills_flat),
        'total_jd_skills': len(matched_skills) + len(missing_skills)
    })


if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
