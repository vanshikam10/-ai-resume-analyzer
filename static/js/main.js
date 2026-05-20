/* ═══════════════════════════════════════════════════════════
   ResumeIQ — Main JS
   ═══════════════════════════════════════════════════════════ */

/* ── Theme Toggle ────────────────────────────────────────── */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

const savedTheme = localStorage.getItem('resumeiq-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('resumeiq-theme', next);
});

/* ── File Upload ─────────────────────────────────────────── */
const dropzone    = document.getElementById('dropzone');
const fileInput   = document.getElementById('resumeFile');
const browseBtn   = document.getElementById('browseBtn');
const fileSelected= document.getElementById('fileSelected');
const dropVisual  = document.querySelector('.drop-visual');
const fileName    = document.getElementById('fileName');
const fileSize    = document.getElementById('fileSize');
const removeFile  = document.getElementById('removeFile');

let selectedFile = null;

browseBtn.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('click', (e) => {
  if (!e.target.closest('.remove-file') && !selectedFile) fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) showFile(fileInput.files[0]);
});

// Drag & drop
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type === 'application/pdf') showFile(f);
  else showToast('Only PDF files are supported', 'error');
});

function showFile(file) {
  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  dropVisual.hidden = true;
  fileSelected.hidden = false;
}

removeFile.addEventListener('click', (e) => {
  e.stopPropagation();
  selectedFile = null;
  fileInput.value = '';
  dropVisual.hidden = false;
  fileSelected.hidden = true;
});

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ── Character Counter ───────────────────────────────────── */
const jdTextarea = document.getElementById('jobDescription');
const charCount  = document.getElementById('charCount');

jdTextarea.addEventListener('input', () => {
  charCount.textContent = jdTextarea.value.length.toLocaleString();
});

/* ── Analyze ─────────────────────────────────────────────── */
const analyzeBtn  = document.getElementById('analyzeBtn');
const btnText     = analyzeBtn.querySelector('.btn-text');
const btnLoader   = analyzeBtn.querySelector('.btn-loader');
const resultsSection = document.getElementById('results');

analyzeBtn.addEventListener('click', analyze);

async function analyze() {
  if (!selectedFile) { showToast('Please upload your resume PDF', 'error'); return; }
  if (!jdTextarea.value.trim()) { showToast('Please paste a job description', 'error'); return; }

  setLoading(true);

  const formData = new FormData();
  formData.append('resume', selectedFile);
  formData.append('job_description', jdTextarea.value);

  try {
    const res  = await fetch('/analyze', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) { showToast(data.error || 'Analysis failed', 'error'); return; }

    renderResults(data);
  } catch (err) {
    showToast('Network error. Is the server running?', 'error');
    console.error(err);
  } finally {
    setLoading(false);
  }
}

function setLoading(on) {
  analyzeBtn.disabled = on;
  btnText.hidden = on;
  btnLoader.hidden = !on;
}

/* ── Render Results ──────────────────────────────────────── */
function renderResults(data) {
  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  renderScore(data.match_percentage, data.matched_skills.length, data.missing_skills.length);
  renderChart(data.resume_skills);
  renderFeedback(data.feedback);
  renderTagList('matchedTags', data.matched_skills, 'tag-green');
  renderTagList('missingTags', data.missing_skills, 'tag-red');
  renderCategories(data.resume_skills);
  renderContact(data.contact_info);
}

/* Score ring */
function renderScore(pct, matched, missing) {
  const scoreNum   = document.getElementById('scoreNum');
  const ringFill   = document.getElementById('ringFill');
  const scoreBadge = document.getElementById('scoreBadge');
  const scoreDesc  = document.getElementById('scoreDesc');
  const matchedCount = document.getElementById('matchedCount');
  const missingCount = document.getElementById('missingCount');

  matchedCount.textContent = matched;
  missingCount.textContent = missing;

  // Inject gradient defs
  const svg = ringFill.closest('svg');
  if (!svg.querySelector('defs')) {
    svg.insertAdjacentHTML('afterbegin', `
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6ee7b7"/>
          <stop offset="100%" stop-color="#818cf8"/>
        </linearGradient>
      </defs>
    `);
    ringFill.setAttribute('stroke', 'url(#ringGradient)');
  }

  // Animate number
  animateNum(scoreNum, 0, pct, 1400);

  // Animate ring (circumference = 2πr = 2π×80 ≈ 502)
  const circumference = 502;
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => ringFill.style.strokeDashoffset = offset, 100);

  // Badge + desc
  if (pct >= 80)       { scoreBadge.textContent = '🎯 Excellent'; scoreBadge.style.color = 'var(--success)'; scoreDesc.textContent = 'Your resume is an outstanding match for this job!'; }
  else if (pct >= 60)  { scoreBadge.textContent = '👍 Good Match'; scoreBadge.style.color = 'var(--warning)'; scoreDesc.textContent = 'Good alignment — a few additions will strengthen your application.'; }
  else if (pct >= 40)  { scoreBadge.textContent = '🔧 Moderate'; scoreBadge.style.color = 'var(--info)'; scoreDesc.textContent = 'You meet some requirements. Bridge the gaps to stand out.'; }
  else                 { scoreBadge.textContent = '🚀 Needs Work'; scoreBadge.style.color = 'var(--danger)'; scoreDesc.textContent = 'Significant gaps detected. Consider upskilling before applying.'; }
}

function animateNum(el, from, to, duration) {
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* Chart */
function renderChart(resumeSkills) {
  const container = document.getElementById('skillsChart');
  container.innerHTML = '';

  const entries = Object.entries(resumeSkills);
  if (!entries.length) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">No categorized skills found.</p>';
    return;
  }

  const max = Math.max(...entries.map(([, v]) => v.length));

  entries.forEach(([cat, skills], i) => {
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.style.animationDelay = `${i * 60}ms`;

    const pct = Math.round((skills.length / Math.max(max, 1)) * 100);

    row.innerHTML = `
      <span class="chart-label" title="${cat}">${cat}</span>
      <div class="chart-bar-wrap">
        <div class="chart-bar-fill" style="width:0%" data-target="${pct}%"></div>
      </div>
      <span class="chart-val">${skills.length}</span>
    `;
    container.appendChild(row);

    setTimeout(() => {
      row.querySelector('.chart-bar-fill').style.width = pct + '%';
    }, 100 + i * 60);
  });
}

/* Feedback */
function renderFeedback(feedbackArr) {
  const grid = document.getElementById('feedbackGrid');
  grid.innerHTML = '';

  feedbackArr.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = `feedback-card ${item.type}`;
    card.style.animationDelay = `${i * 80}ms`;
    card.innerHTML = `
      <span class="feedback-emoji">${item.icon}</span>
      <div>
        <div class="feedback-title">${item.title}</div>
        <div class="feedback-text">${item.text}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* Tag lists */
function renderTagList(containerId, skills, cls) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!skills.length) {
    container.innerHTML = `<span style="color:var(--text-dim);font-size:.82rem">None detected</span>`;
    return;
  }

  skills.forEach((s, i) => {
    const tag = document.createElement('span');
    tag.className = `tag ${cls}`;
    tag.textContent = s;
    tag.style.animationDelay = `${i * 40}ms`;
    container.appendChild(tag);
  });
}

/* Categories */
function renderCategories(resumeSkills) {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  Object.entries(resumeSkills).forEach(([cat, skills], i) => {
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.style.animationDelay = `${i * 60}ms`;

    const tagsHtml = skills.map(s => `<span class="cat-tag">${s}</span>`).join('');

    card.innerHTML = `
      <div class="cat-title">${cat}</div>
      <div class="cat-tags">${tagsHtml}</div>
    `;
    grid.appendChild(card);
  });
}

/* Contact info */
function renderContact(info) {
  const section = document.getElementById('contactSection');
  const grid    = document.getElementById('contactGrid');

  if (!info || !Object.keys(info).length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  grid.innerHTML = '';

  const icons = { email: '📧', phone: '📱', linkedin: '💼', github: '🐙' };

  Object.entries(info).forEach(([key, value]) => {
    const item = document.createElement('div');
    item.className = 'contact-item';
    item.innerHTML = `
      <span>${icons[key] || '📌'}</span>
      <div>
        <span class="contact-label">${key}</span>
        <div>${value}</div>
      </div>
    `;
    grid.appendChild(item);
  });
}

/* ── Analyze Again ───────────────────────────────────────── */
document.getElementById('analyzeAgainBtn').addEventListener('click', () => {
  resultsSection.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Toast ───────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px);
    background:var(--bg-2); border:1px solid ${type === 'error' ? 'rgba(248,113,113,0.4)' : 'var(--border)'};
    color:${type === 'error' ? 'var(--danger)' : 'var(--text)'};
    padding:12px 24px; border-radius:10px; font-size:.85rem; font-family:var(--font-display);
    box-shadow:0 8px 32px rgba(0,0,0,0.4); z-index:9999;
    transition:all .3s ease; opacity:0;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
