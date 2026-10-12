// PDF size-reduction tool — entirely client-side (nothing is uploaded).
// Renders each page to a canvas and re-encodes it as a compressed JPEG,
// then rebuilds a new PDF from those images with pdf.js + jsPDF.
import * as pdfjsLib from './pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.min.mjs';

const QUALITY_PRESETS = {
  high:   { scale: 1.6, jpegQuality: 0.82 },
  medium: { scale: 1.25, jpegQuality: 0.62 },
  max:    { scale: 1.0,  jpegQuality: 0.4 },
};

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileNameEl = document.getElementById('fileName');
const originalSizeEl = document.getElementById('originalSize');
const qualitySection = document.getElementById('qualitySection');
const compressBtn = document.getElementById('compressBtn');
const progressWrap = document.getElementById('progressWrap');
const progressLabel = document.getElementById('progressLabel');
const progressBar = document.getElementById('progressBar');
const resultBox = document.getElementById('resultBox');
const resSizeBefore = document.getElementById('resSizeBefore');
const resSizeAfter = document.getElementById('resSizeAfter');
const resPercent = document.getElementById('resPercent');
const downloadLink = document.getElementById('downloadLink');
const errorBox = document.getElementById('errorBox');

let selectedFile = null;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' بایت';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' کیلوبایت';
  return (bytes / (1024 * 1024)).toFixed(2) + ' مگابایت';
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function clearError() {
  errorBox.style.display = 'none';
  errorBox.textContent = '';
}

function selectFile(file) {
  clearError();
  resultBox.style.display = 'none';
  if (!file) return;
  if (file.type !== 'application/pdf') {
    showError('فقط فایل PDF قابل قبول است.');
    return;
  }
  selectedFile = file;
  fileNameEl.textContent = file.name;
  originalSizeEl.textContent = formatBytes(file.size);
  fileInfo.style.display = 'block';
  qualitySection.style.display = 'block';
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});
fileInput.addEventListener('change', (e) => selectFile(e.target.files[0]));

['dragover', 'dragenter'].forEach((evt) => {
  dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
});
['dragleave', 'drop'].forEach((evt) => {
  dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
});
dropZone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  selectFile(file);
});

document.querySelectorAll('.quality-option').forEach((label) => {
  label.addEventListener('click', () => {
    document.querySelectorAll('.quality-option').forEach((l) => l.classList.remove('selected'));
    label.classList.add('selected');
  });
});

function getSelectedQuality() {
  const checked = document.querySelector('input[name="quality"]:checked');
  return checked ? checked.value : 'medium';
}

async function compressPdf(file, preset, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const { jsPDF } = window.jspdf;
  let outputPdf = null;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress(pageNum, pdf.numPages);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: preset.scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = canvas.toDataURL('image/jpeg', preset.jpegQuality);
    const orientation = canvas.width > canvas.height ? 'l' : 'p';

    if (!outputPdf) {
      outputPdf = new jsPDF({ orientation, unit: 'pt', format: [canvas.width, canvas.height] });
    } else {
      outputPdf.addPage([canvas.width, canvas.height], orientation);
    }
    outputPdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

    // Release canvas memory before the next page.
    canvas.width = 0;
    canvas.height = 0;
  }

  return outputPdf.output('blob');
}

compressBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  clearError();
  resultBox.style.display = 'none';
  progressWrap.style.display = 'block';
  progressBar.style.width = '0%';
  compressBtn.disabled = true;

  const level = getSelectedQuality();
  const preset = QUALITY_PRESETS[level];

  try {
    const blob = await compressPdf(selectedFile, preset, (current, total) => {
      progressLabel.textContent = `در حال پردازش صفحه ${current} از ${total}...`;
      progressBar.style.width = Math.round((current / total) * 100) + '%';
    });

    const originalSize = selectedFile.size;
    const newSize = blob.size;
    const reduction = originalSize > 0 ? Math.round((1 - newSize / originalSize) * 100) : 0;

    resSizeBefore.textContent = formatBytes(originalSize);
    resSizeAfter.textContent = formatBytes(newSize);
    resPercent.textContent = reduction > 0 ? `${reduction}٪ کاهش` : 'بدون کاهش قابل‌توجه';

    const url = URL.createObjectURL(blob);
    const baseName = selectedFile.name.replace(/\.pdf$/i, '');
    downloadLink.href = url;
    downloadLink.setAttribute('download', `${baseName}-compressed.pdf`);

    resultBox.style.display = 'block';
  } catch (err) {
    console.error(err);
    showError('پردازش فایل با خطا مواجه شد. لطفاً مطمئن شوید فایل یک PDF سالم است و دوباره تلاش کنید.');
  } finally {
    progressWrap.style.display = 'none';
    compressBtn.disabled = false;
  }
});
