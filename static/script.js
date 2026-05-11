/* ── State ────────────────────────────────────────────────── */
let docText = '';
let docType = '';
let sessionId = null;
let hasPdf = false;
let allQuestions = [];
let pdfReady = false;        // true once PDF pages are in the DOM
let questionsReady = false;  // true once all questions streamed in
let pendingPositions = null; // positions waiting for PDF to render

/* ── Helpers ──────────────────────────────────────────────── */
function showError(msg) {
  let el = document.getElementById('error-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'error-toast';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#dc2626;color:#fff;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,.2);z-index:999;max-width:480px;text-align:center';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el && el.remove(), 7000);
}

function setStatus(msg, done = false) {
  document.getElementById('loading-msg').textContent = msg;
  const bar = document.getElementById('status-bar');
  if (done) bar.classList.add('done');
  else bar.classList.remove('done');
}

function docTypeLabel(type) {
  return { government_form: 'Government Form', business_plan: 'Business Plan', contract: 'Contract', general: 'Document' }[type] || 'Document';
}
function docTypeBadgeClass(type) {
  return { government_form: 'govt', business_plan: 'biz', contract: 'contract' }[type] || '';
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMarkdown(text) {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huli])(.+)$/gm, m => m.trim() ? `<p>${m}</p>` : '')
    .replace(/<p><\/p>/g, '');
}

/* ── Tabs ─────────────────────────────────────────────────── */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('pane-' + btn.dataset.tab).classList.add('active');
  });
});

/* ── Dyslexia mode ────────────────────────────────────────── */
document.getElementById('dyslexia-btn').addEventListener('click', () => {
  document.body.classList.toggle('dyslexia');
  const on = document.body.classList.contains('dyslexia');
  document.getElementById('dyslexia-btn').textContent = on ? 'Aa  Standard Font' : 'Aa  Dyslexia Mode';
});

/* ── File drop zone ───────────────────────────────────────── */
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) submitFile(f);
});
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { if (fileInput.files[0]) submitFile(fileInput.files[0]); });

/* ── Text / URL ───────────────────────────────────────────── */
document.getElementById('text-submit').addEventListener('click', () => {
  const t = document.getElementById('text-input').value.trim();
  if (!t) return showError('Please paste some text first.');
  submitText(t);
});
document.getElementById('url-submit').addEventListener('click', () => {
  const u = document.getElementById('url-input').value.trim();
  if (!u) return showError('Please enter a URL.');
  submitUrl(u);
});

/* ── Chips ────────────────────────────────────────────────── */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const url = chip.dataset.url;
    if (!url) return showError('This form link is coming soon. Download the form and upload it instead.');
    submitUrl(url);
  });
});

/* ── Back / Summary ───────────────────────────────────────── */
document.getElementById('back-btn').addEventListener('click', () => {
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('upload-section').style.display = '';
  docText = ''; docType = ''; sessionId = null; hasPdf = false; allQuestions = [];
  pdfReady = false; questionsReady = false; pendingPositions = null;
});

document.getElementById('summary-toggle').addEventListener('click', () => {
  const panel = document.getElementById('summary-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden'))
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.getElementById('summary-close').addEventListener('click', () => {
  document.getElementById('summary-panel').classList.add('hidden');
});

/* ── Submit handlers ──────────────────────────────────────── */
async function submitFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  await runExtract(fd);
}
async function submitText(text) {
  const fd = new FormData();
  fd.append('text', text);
  await runExtract(fd);
}
async function submitUrl(url) {
  const fd = new FormData();
  fd.append('url', url);
  await runExtract(fd);
}

async function runExtract(formData) {
  // Switch to results view immediately
  document.getElementById('upload-section').style.display = 'none';
  const rs = document.getElementById('results-section');
  rs.classList.remove('hidden');
  document.getElementById('pdf-viewer').innerHTML = '<div class="pdf-loading"><div class="spinner"></div><p>Reading your document…</p></div>';
  document.getElementById('text-viewer').classList.add('hidden');
  document.getElementById('summary-panel').classList.add('hidden');
  document.getElementById('summary-content').innerHTML = '';
  document.getElementById('summary-loading').style.display = '';
  allQuestions = [];
  pdfReady = false; questionsReady = false; pendingPositions = null;
  setStatus('Reading your document…');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    const res = await fetch('/api/extract', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Could not read document.');

    docText = data.text;
    docType = data.doc_type;
    sessionId = data.session_id;
    hasPdf = data.has_pdf;

    // Update badge
    const badge = document.getElementById('doc-type-badge');
    badge.textContent = docTypeLabel(docType);
    badge.className = 'badge ' + docTypeBadgeClass(docType);

    setStatus('Found the document — now finding every question…');

    if (hasPdf) {
      // Load PDF pages + questions in parallel
      Promise.all([loadPdfPages(), loadQuestions()]);
    } else {
      // Text fallback
      document.getElementById('pdf-viewer').style.display = 'none';
      const tv = document.getElementById('text-viewer');
      tv.classList.remove('hidden');
      tv.textContent = docText;
      loadQuestions();
    }

    loadSummary();

  } catch (err) {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('upload-section').style.display = '';
    showError(err.message);
  }
}

/* ── Load PDF pages ───────────────────────────────────────── */
async function loadPdfPages() {
  const viewer = document.getElementById('pdf-viewer');
  viewer.innerHTML = '<div class="pdf-loading"><div class="spinner"></div><p>Rendering your document…</p></div>';

  try {
    const res = await fetch(`/api/render/${sessionId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Could not render PDF.');

    viewer.innerHTML = '';
    data.pages.forEach(p => {
      const wrap = document.createElement('div');
      wrap.className = 'pdf-page';
      wrap.dataset.page = p.page;
      wrap.dataset.origW = p.orig_width;
      wrap.dataset.origH = p.orig_height;
      wrap.dataset.imgW = p.width;
      wrap.dataset.imgH = p.height;

      const img = document.createElement('img');
      img.src = p.image;
      img.alt = `Page ${p.page + 1}`;
      wrap.appendChild(img);
      viewer.appendChild(wrap);
    });

    setStatus('Document loaded — finding questions…');
    pdfReady = true;

    // If questions already finished while PDF was rendering, apply overlays now
    if (questionsReady && pendingPositions !== null) {
      overlayQuestions(pendingPositions);
    }

  } catch (err) {
    viewer.innerHTML = `<p style="padding:40px;color:#dc2626;text-align:center">Could not render PDF: ${err.message}</p>`;
  }
}

/* ── Load questions (streaming) ───────────────────────────── */
async function loadQuestions() {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: docText, doc_type: docType }),
    });
    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.detail || 'Could not analyse questions.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let count = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          finishQuestions(count);
          return;
        }
        try {
          const q = JSON.parse(payload);
          if (q.error) throw new Error(q.error);
          count++;
          q._num = count;
          allQuestions.push(q);
          setStatus(`Found ${count} questions so far…`);
        } catch {}
      }
    }
    finishQuestions(count);
  } catch (err) {
    setStatus('Could not find questions: ' + err.message, true);
    showError('Question analysis failed: ' + err.message);
  }
}

async function finishQuestions(count) {
  setStatus(`${count} questions found — hover any yellow highlight, or use the list below`, true);
  questionsReady = true;
  buildQuestionList(); // always show the fallback list

  if (hasPdf && sessionId) {
    // Get positions from backend
    try {
      const res = await fetch('/api/locate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, questions: allQuestions }),
      });
      const data = await res.json();
      pendingPositions = data.positions || {};
    } catch {
      pendingPositions = {};
    }

    if (pdfReady) {
      // PDF already rendered — apply overlays immediately
      overlayQuestions(pendingPositions);
    }
    // else: loadPdfPages() will apply them when it finishes
  } else {
    highlightTextViewer();
  }
}

/* ── Overlay questions on PDF pages ──────────────────────── */
function overlayQuestions(positions = {}) {
  // Remove any existing overlays
  document.querySelectorAll('.q-overlay').forEach(el => el.remove());

  const pages = document.querySelectorAll('.pdf-page');
  if (!pages.length) return;

  allQuestions.forEach(q => {
    const qid = String(q.id || q._num);
    const pos = positions[qid];
    if (!pos) return;

    const pageEl = document.querySelector(`.pdf-page[data-page="${pos.page}"]`);
    if (!pageEl) return;

    const overlay = document.createElement('div');
    overlay.className = 'q-overlay';
    overlay.dataset.qid = qid;
    overlay.style.left   = pos.x + '%';
    overlay.style.top    = pos.y + '%';
    overlay.style.width  = Math.max(pos.w, 20) + '%';
    overlay.style.height = Math.max(pos.h, 2) + '%';

    // Number badge
    const badge = document.createElement('div');
    badge.className = 'q-overlay-num';
    badge.textContent = q._num;
    overlay.appendChild(badge);

    // Hover tooltip
    const tooltip = buildTooltip(q);
    overlay.appendChild(tooltip);

    // Click opens full modal and highlights sidebar card
    overlay.addEventListener('click', () => {
      openModal(q, docType);
      const card = document.querySelector(`.q-card[data-qid="${qid}"]`);
      if (card) setActiveCard(card);
    });

    // Flip tooltip if near bottom or right edge
    overlay.addEventListener('mouseenter', () => {
      const rect = overlay.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();
      overlay.classList.toggle('flip-up', rect.bottom + 260 > window.innerHeight);
      overlay.classList.toggle('flip-left', rect.left + 340 > pageRect.right);
    });

    pageEl.appendChild(overlay);
  });
}

function buildTooltip(q) {
  const tt = document.createElement('div');
  tt.className = 'q-tooltip';

  const sections = [];
  if (q.plain_english) sections.push({ label: '💬 In plain English', text: q.plain_english });
  if (q.example)       sections.push({ label: '📝 Example', text: q.example, example: true });

  sections.forEach(s => {
    const lbl = document.createElement('div');
    lbl.className = 'q-tooltip-label';
    lbl.textContent = s.label;
    tt.appendChild(lbl);

    const txt = document.createElement('div');
    txt.className = s.example ? 'q-tooltip-example' : 'q-tooltip-text';
    txt.textContent = s.text;
    tt.appendChild(txt);
  });

  const more = document.createElement('div');
  more.className = 'q-tooltip-more';
  more.textContent = 'Click for tips and full details →';
  tt.appendChild(more);

  return tt;
}

/* ── Text fallback highlighting ───────────────────────────── */
function highlightTextViewer() {
  const tv = document.getElementById('text-viewer');
  if (!tv || !allQuestions.length) return;

  const scroll = tv.scrollTop;
  const ranges = [];

  allQuestions.forEach(q => {
    const needle = (q.original || '').trim();
    if (!needle) return;
    let idx = docText.indexOf(needle);
    if (idx === -1 && needle.length > 80) idx = docText.indexOf(needle.substring(0, 80));
    if (idx === -1) return;
    ranges.push({ start: idx, end: idx + Math.min(needle.length, 80), q });
  });

  ranges.sort((a, b) => a.start - b.start);

  let html = '';
  let pos = 0;
  for (const r of ranges) {
    if (r.start < pos) continue;
    html += escHtml(docText.slice(pos, r.start));
    html += `<mark style="background:#fef9c3;border-bottom:2px solid #eab308;cursor:pointer;border-radius:2px" onclick="openModalByNum(${r.q._num})">`;
    html += escHtml(docText.slice(r.start, r.end));
    html += `<sup style="background:var(--blue);color:#fff;font-size:10px;padding:1px 5px;border-radius:8px;margin-left:3px;font-family:sans-serif">${r.q._num}</sup>`;
    html += '</mark>';
    pos = r.end;
  }
  html += escHtml(docText.slice(pos));

  tv.innerHTML = html.replace(/\n/g, '<br>');
  tv.scrollTop = scroll;
}

function openModalByNum(num) {
  const q = allQuestions.find(x => x._num === num);
  if (q) openModal(q, docType);
}

/* ── Question cards in sidebar ────────────────────────────── */
function buildQuestionList() {
  const body  = document.getElementById('sidebar-body');
  const title = document.getElementById('sidebar-title');
  if (!body) return;

  if (title) title.textContent = `${allQuestions.length} questions found`;

  const loading = document.getElementById('sidebar-loading');
  if (loading) loading.remove();

  body.innerHTML = '';

  allQuestions.forEach(q => {
    const card = document.createElement('div');
    card.className = 'q-card';
    card.dataset.qid = String(q.id || q._num);

    const head = document.createElement('div');
    head.className = 'q-card-head';
    head.innerHTML = `
      <div class="q-card-num">${q._num}</div>
      <div class="q-card-original">${escHtml(q.original || '')}</div>
    `;
    card.appendChild(head);

    if (q.plain_english) {
      const plain = document.createElement('div');
      plain.className = 'q-card-plain';
      plain.textContent = q.plain_english;
      card.appendChild(plain);
    }

    if (q.example) {
      const ex = document.createElement('div');
      ex.className = 'q-card-example';
      ex.textContent = q.example;
      card.appendChild(ex);
    }

    const hasMore = q.tips || q.why_they_ask || q.what_you_agree_to || q.watch_out_for || q.common_mistakes;
    if (hasMore) {
      const more = document.createElement('button');
      more.className = 'q-card-more';
      more.textContent = 'Full tips & details →';
      more.addEventListener('click', e => { e.stopPropagation(); openModal(q, docType); });
      card.appendChild(more);
    }

    card.addEventListener('click', () => {
      scrollToQuestion(q);
      setActiveCard(card);
    });

    body.appendChild(card);
  });
}

function scrollToQuestion(q) {
  const qid = String(q.id || q._num);
  const overlay = document.querySelector(`.q-overlay[data-qid="${qid}"]`);
  if (overlay) {
    overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    overlay.classList.add('pulse');
    setTimeout(() => overlay.classList.remove('pulse'), 1400);
  }
}

function setActiveCard(card) {
  document.querySelectorAll('.q-card.active').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Load summary (streaming) ─────────────────────────────── */
async function loadSummary() {
  const summaryEl = document.getElementById('summary-content');
  const loadingEl = document.getElementById('summary-loading');
  let accumulated = '';

  try {
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: docText, doc_type: docType }),
    });
    if (!res.ok) throw new Error('Summary failed');

    loadingEl.style.display = 'none';

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) throw new Error(parsed.error);
          accumulated += parsed.text || '';
          summaryEl.innerHTML = renderMarkdown(accumulated);
        } catch {}
      }
    }
    summaryEl.innerHTML = renderMarkdown(accumulated);
  } catch (err) {
    loadingEl.style.display = 'none';
    summaryEl.innerHTML = `<p style="color:#dc2626">Could not load summary: ${err.message}</p>`;
  }
}

/* ── Modal ────────────────────────────────────────────────── */
function openModal(q, type) {
  document.getElementById('modal-badge').innerHTML =
    `<span class="badge ${docTypeBadgeClass(type)}">${docTypeLabel(type)}</span>`;
  document.getElementById('modal-original').textContent = q.original || '';

  const body = document.getElementById('modal-body');
  body.innerHTML = '';

  const sections = buildModalSections(q, type);
  sections.forEach(s => {
    if (!s.value) return;
    const div = document.createElement('div');
    div.className = `modal-section ${s.cls || ''}`;
    div.innerHTML = `
      <div class="modal-section-label">${s.icon} ${s.label}</div>
      <div class="modal-section-body">${escHtml(s.value)}</div>
    `;
    body.appendChild(div);
  });

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function buildModalSections(q, type) {
  if (type === 'government_form') return [
    { icon: '💬', label: 'In plain English',   value: q.plain_english },
    { icon: '📝', label: 'Example answer',      value: q.example,      cls: 'example' },
    { icon: 'ℹ️', label: 'Why they ask this',   value: q.why_they_ask  },
    { icon: '💡', label: 'Tips',                value: q.tips,         cls: 'tip' },
  ];
  if (type === 'business_plan') return [
    { icon: '💬', label: 'What they are asking',       value: q.plain_english },
    { icon: '📝', label: 'Example answer',              value: q.example,       cls: 'example' },
    { icon: 'ℹ️', label: 'Why this matters to lenders', value: q.why_they_ask   },
    { icon: '💡', label: 'Tips for a strong answer',    value: q.tips,          cls: 'tip' },
    { icon: '⚠️', label: 'Common mistakes',             value: q.common_mistakes, cls: 'watch' },
  ];
  if (type === 'contract') return [
    { icon: '💬', label: 'In plain English',       value: q.plain_english    },
    { icon: '✍️', label: 'What you are agreeing to', value: q.what_you_agree_to },
    { icon: '⚠️', label: 'Watch out for',          value: q.watch_out_for,   cls: 'watch' },
    { icon: '📝', label: 'Real-world example',     value: q.example,         cls: 'example' },
  ];
  return [
    { icon: '💬', label: 'In plain English', value: q.plain_english },
    { icon: '📝', label: 'Example',          value: q.example,      cls: 'example' },
    { icon: '💡', label: 'Tips',             value: q.tips,         cls: 'tip' },
  ];
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}
