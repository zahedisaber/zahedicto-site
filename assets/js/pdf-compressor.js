// PDF size-reduction tool — entirely client-side (nothing is uploaded).
// Renders each page to a canvas (once, at a fixed high resolution) and
// re-encodes it as a JPEG, then rebuilds a new PDF from those images with
// pdf.js + jsPDF. Automatically tries progressively stronger JPEG
// compression — never lower resolution — until the whole document is at
// or under the target size (most embassy/university upload portals cap
// uploads around 4MB), reusing the same rendered canvases across attempts
// so it doesn't need to re-render the PDF for each try.
import * as pdfjsLib from './pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.min.mjs';

// Fixed render resolution, the same for every compression attempt — about
// 216 DPI relative to the page's declared physical size (PDF points are
// 1/72 inch, so scale 3.0 == 3.0 * 72 = 216 pixels per inch). This is
// comfortably above typical scan resolutions (150-300 DPI); only JPEG
// compression strength changes between attempts, never resolution/DPI.
const RENDER_SCALE = 3.0;

const TARGET_MAX_BYTES = 4 * 1024 * 1024; // 4 مگابایت
const QUALITY_LADDER = [0.85, 0.72, 0.6, 0.48, 0.36, 0.25, 0.15];

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileNameEl = document.getElementById('fileName');
const originalSizeEl = document.getElementById('originalSize');
const actionSection = document.getElementById('actionSection');
const compressBtn = document.getElementById('compressBtn');
const progressWrap = document.getElementById('progressWrap');
const progressLabel = document.getElementById('progressLabel');
const progressBar = document.getElementById('progressBar');
const resultBox = document.getElementById('resultBox');
const resSizeBefore = document.getElementById('resSizeBefore');
const resSizeAfter = document.getElementById('resSizeAfter');
const resPercent = document.getElementById('resPercent');
const resWarning = document.getElementById('resWarning');
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
  actionSection.style.display = 'block';
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

// Render every page once, at the fixed resolution, and cache the canvases
// so repeated compression attempts only re-run the cheap JPEG encode step.
async function renderPagesToCanvases(file, onPageProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onPageProgress(pageNum, pdf.numPages);
    const page = await pdf.getPage(pageNum);

    // True physical page size in PDF points — the output page box must
    // match this so the document keeps its real printed size, independent
    // of how many pixels it's rendered at.
    const basePageViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale: RENDER_SCALE });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

    pages.push({ canvas, widthPt: basePageViewport.width, heightPt: basePageViewport.height });
  }
  return pages;
}

function buildPdfAtQuality(pages, jpegQuality) {
  const { jsPDF } = window.jspdf;
  let outputPdf = null;
  for (const p of pages) {
    const imgData = p.canvas.toDataURL('image/jpeg', jpegQuality);
    const orientation = p.widthPt > p.heightPt ? 'l' : 'p';
    if (!outputPdf) {
      outputPdf = new jsPDF({ orientation, unit: 'pt', format: [p.widthPt, p.heightPt] });
    } else {
      outputPdf.addPage([p.widthPt, p.heightPt], orientation);
    }
    // Full-resolution image embedded inside a page box sized at the
    // original physical dimensions — that combination is what gives the
    // output its DPI, and it's identical across every quality attempt.
    outputPdf.addImage(imgData, 'JPEG', 0, 0, p.widthPt, p.heightPt);
  }
  return outputPdf.output('blob');
}

function releaseCanvases(pages) {
  for (const p of pages) { p.canvas.width = 0; p.canvas.height = 0; }
}

async function compressToTarget(file, onStatus) {
  const pages = await renderPagesToCanvases(file, (current, total) => {
    onStatus(`در حال رندر صفحه ${current} از ${total}...`, (current / total) * 50);
  });

  let bestBlob = null;
  for (let i = 0; i < QUALITY_LADDER.length; i++) {
    const quality = QUALITY_LADDER[i];
    onStatus(
      `تلاش ${i + 1} از ${QUALITY_LADDER.length}: فشرده‌سازی با کیفیت ${Math.round(quality * 100)}٪...`,
      50 + ((i + 1) / QUALITY_LADDER.length) * 50
    );
    // Yield to the browser so the progress bar actually repaints between attempts.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const blob = buildPdfAtQuality(pages, quality);
    if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
    if (blob.size <= TARGET_MAX_BYTES) {
      releaseCanvases(pages);
      return { blob, achievedTarget: true };
    }
  }

  releaseCanvases(pages);
  return { blob: bestBlob, achievedTarget: false };
}

compressBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  clearError();
  resultBox.style.display = 'none';
  resWarning.style.display = 'none';
  progressWrap.style.display = 'block';
  progressBar.style.width = '0%';
  compressBtn.disabled = true;

  try {
    const { blob, achievedTarget } = await compressToTarget(selectedFile, (label, percent) => {
      progressLabel.textContent = label;
      progressBar.style.width = Math.round(percent) + '%';
    });

    const originalSize = selectedFile.size;
    const newSize = blob.size;
    const reduction = originalSize > 0 ? Math.round((1 - newSize / originalSize) * 100) : 0;

    resSizeBefore.textContent = formatBytes(originalSize);
    resSizeAfter.textContent = formatBytes(newSize);
    resPercent.textContent = reduction > 0 ? `${reduction}٪ کاهش` : 'بدون کاهش قابل‌توجه';

    if (!achievedTarget) {
      resWarning.textContent = `با وجود بیشترین فشرده‌سازی ممکن (بدون افت وضوح تصویر)، حجم فایل همچنان بالای ۴ مگابایت است. برای مدارک حجیم یا چندصفحه‌ای، پیشنهاد می‌شود فایل را به چند بخش تقسیم کنید یا با دفتر تماس بگیرید.`;
      resWarning.style.display = 'block';
    }

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
