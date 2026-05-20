# 🧠 AI Resume Analyzer

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![NLP](https://img.shields.io/badge/NLP-Keyword%20Extraction-6ee7b7?style=for-the-badge)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-f472b6?style=for-the-badge)

**Upload PDF resume → Paste Job Description → Get AI-powered match score instantly**

[🚀 Live Demo](#) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 📄 **PDF Resume Upload** | Drag & drop or browse — up to 5MB |
| 🔍 **Skill Extraction** | Detects 50+ skills across 7 categories |
| 📊 **JD Matching** | Compares your skills vs job description |
| 🎯 **Match Score** | Animated score ring (0–100%) |
| 💡 **AI Feedback** | Actionable improvement suggestions |
| 📇 **Contact Detection** | Email, phone, LinkedIn, GitHub |
| 🌙 **Dark / Light Mode** | Persistent theme toggle |
| 📱 **Fully Responsive** | Mobile, tablet & desktop |

---

## 🛠️ Tech Stack

```
Backend  →  Python 3.11 · Flask 3.0 · PyPDF2 · Regex NLP · Gunicorn
Frontend →  HTML5 · CSS3 (Variables + Animations) · Vanilla JS
Deploy   →  Render (free tier) / Heroku / Railway
```

---

## 📂 Project Structure

```
ai-resume-analyzer/
├── app.py              ← Flask backend (NLP + PDF + matching logic)
├── requirements.txt    ← All Python dependencies
├── Procfile            ← For Render / Heroku deployment
├── render.yaml         ← One-click Render config
├── runtime.txt         ← Python version pin
├── .gitignore
├── README.md
├── templates/
│   └── index.html      ← Full single-page frontend
├── static/
│   ├── css/style.css   ← Dark/light theme, animations
│   └── js/main.js      ← Upload, analysis, results
└── uploads/            ← Temp folder (auto-created, gitignored)
```

---

## 🚀 Local Setup (VS Code)

### 1 — Clone

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2 — Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

> VS Code tip: `Ctrl+Shift+P` → **Python: Select Interpreter** → pick `venv`

### 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

### 4 — Run

```bash
python app.py
```

Open **http://localhost:5000** 🎉

---

## ☁️ Deploy to Render (Free — Shareable Link)

> Render gives you a **free public URL** like `https://ai-resume-analyzer.onrender.com`

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial AI Resume Analyzer project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
git push -u origin main
```

### Step 2 — Deploy on Render

1. Go to **[render.com](https://render.com)** → Sign up free with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo → select `ai-resume-analyzer`
4. Render auto-detects settings from `render.yaml`
5. Click **"Create Web Service"**
6. Wait ~2 min → get your live URL ✅

### Environment Variables (optional)

| Key | Value |
|---|---|
| `FLASK_ENV` | `production` |

---

## 🧠 How It Works

```
PDF Upload  →  PyPDF2 extracts text
                    ↓
            Regex NLP scans for 50+ skills
                    ↓
            Same scan on Job Description text
                    ↓
       Match % = (resume ∩ JD skills) / JD skills × 100
                    ↓
         Feedback engine generates cards
                    ↓
       Animated score ring + bar chart rendered
```

---

## 🗂️ Skill Categories

| Category | Examples |
|---|---|
| 💻 Programming | Python, Java, JavaScript, C++, Go, Rust |
| 🌐 Web | React, Node.js, Django, Flask, FastAPI, GraphQL |
| 🗄️ Databases | SQL, MongoDB, PostgreSQL, Redis, Firebase |
| 🤖 AI / ML | TensorFlow, PyTorch, NLP, Pandas, OpenCV |
| ☁️ DevOps | Docker, Kubernetes, AWS, Azure, GCP, CI/CD |
| 🔧 Tools | Git, GitHub, Figma, Postman, Jira |
| 🤝 Soft Skills | Leadership, Communication, Problem Solving |

---

## 🎨 Customize

```python
# app.py → Add more skills to any category:
SKILL_CATEGORIES = {
    "Programming Languages": ["python", "your-skill-here", ...],
}
```

```css
/* style.css → Change accent color: */
:root {
  --accent: #6ee7b7;  /* ← change this */
}
```

---

## ⚠️ Known Limitations

- Works best with **text-based PDFs** (not scanned images)
- Skill matching is **keyword-based** — not semantic
- Files are **never stored** — deleted after analysis (privacy-first)

---

## 🗺️ Roadmap

- [ ] spaCy / NLTK for smarter extraction
- [ ] Sentence-transformer semantic matching
- [ ] Export results as PDF report
- [ ] Cover letter generator
- [ ] ATS score simulation

---

## 🤝 Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# Open a Pull Request
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ · Perfect for CSE fresher portfolios · ⭐ Star if it helped!

</div>