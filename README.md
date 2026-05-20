# AI Resume Analyzer

Upload your PDF resume, paste a job description, and get an instant skill match score.

## Features

- PDF resume upload
- Skill extraction (50+ skills across 7 categories)
- Job description matching
- Match score with visual chart
- AI feedback suggestions
- Dark / Light mode
- Fully responsive

## Tech Stack

- Python 3.11 + Flask
- PyPDF2 (PDF parsing)
- Vanilla HTML / CSS / JavaScript

## Project Structure

```
ai-resume-analyzer/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/main.js
```

## Run Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run
python app.py
```

Open **http://localhost:5000** in your browser.

## How It Works

1. Upload PDF → text extracted via PyPDF2
2. Resume + JD both scanned for keywords
3. Match % = overlapping skills / JD skills × 100
4. Score ring + feedback cards rendered

## License

MIT