/**
 * bootable-studio - Client-side ISO inspection and build
 * All processing happens in the browser - no files leave the user's computer
 */

// DOM Elements
const isoInput = document.getElementById('isoInput');
const browseBtn = document.getElementById('browseBtn');
const uploadArea = document.getElementById('uploadArea');
const resultsArea = document.getElementById('resultsArea');
const isoInfo = document.getElementById('isoInfo');
const buildBtn = document.getElementById('buildBtn');
const downloadBtn = document.getElementById('downloadBtn');
const warningsPanel = document.getElementById('warningsPanel');
const warningsList = document.getElementById('warningsList');
const downloadArea = document.getElementById('downloadArea');
const fileInfo = document.getElementById('fileInfo');
const rawRadio = document.querySelector('input[value="raw"]');
const chainloadRadio = document.querySelector('input[value="chainload"]');
const padToMiBCheck = document.getElementById('padToMiB');
const rawReason = document.getElementById('rawReason');
const chainloadReason = document.getElementById('chainloadReason');
const buildModeRadios = document.querySelectorAll('input[name="buildMode"]');

// State
let isoInfo = null;
let builtBlob = null;
let builtMode = null;
let builtFilename = null;

// Import modules using ES modules
import { inspectIso } from './src/iso.js';
import { buildImage } from './src/builder.js';

// UI Update Functions

function showSection(sectionId, show) {
  const sections = document.querySelectorAll('.results-area > div');
  sections.forEach(s => s.style.display = 'none');
  document.getElementById(sectionId).style.display = show ? 'block' : 'none';
}

function updateRawReason() {
  if (rawRadio.checked) {
    rawReason.style.display = 'inline';
    chainloadReason.style.display = 'none';
  } else {
    rawReason.style.display = 'none';
  }
}

function updateChainloadReason() {
  if (chainloadRadio.checked) {
    chainloadReason.style.display = 'inline';
    rawReason.style.display = 'none';
  } else {
    chainloadReason.style.display = 'none';
  }
}

// Event Listeners

browseBtn.addEventListener('click', () => isoInput.click());

isoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  showSection('resultsArea', false);
  showSection('uploadArea', true);

  try {
    const blob = new Blob([await file.arrayBuffer()], { type: 'application/x-iso9660-image' });
    isoInfo = await inspectIso(blob);

    // Populate ISO info
    isoInfo.innerHTML = `
      <p><strong>Volume ID:</strong> ${isoInfo.iso.volumeId}</p>
      <p><strong>Block Size:</strong> ${isoInfo.iso.blockSize} bytes</p>
      <p><strong>Modo Recomendado:</strong> <span id="recommendedMode">${isoInfo.boot.recommendedMode}</span></p>
      <p><strong>Boot BIOS (CD):</strong> ${isoInfo.boot.biosCd ? 'Sim' : 'Não'}</p>
      <p><strong>Boot USB (BIOS):</strong> ${isoInfo.boot.biosUsb ? 'Sim' : 'Não'}</p>
      ${isoInfo.boot.uefiCd ? '<p><strong>Boot UEFI (CD):</strong> Sim</p>' : ''}
      ${isoInfo.boot.uefiUsb ? '<p><strong>Boot USB (UEFI):</strong> Sim</p>' : ''}
      <p><strong>Modo Isohybrid:</strong> ${isoInfo.mbr.isohybrid ? 'Sim' : 'Não'}</p>
      ${isoInfo.boot.chainloadEntry ? '<p><strong>Entrada chainload disponível:</strong> Sim</p>' : ''}
    `;

    // Update mode recommendations
    updateModeRecommendations(isoInfo);

    showSection('resultsArea', true);
    showSection('uploadArea', false);
    buildBtn.disabled = false;

  } catch (error) {
    alert('Erro ao inspecionar ISO: ' + error.message);
    console.error(error);
  }
}

function updateModeRecommendations(info) {
  // Update radio reasons based on ISO structure
  if (info.mbr.isohybrid) {
    rawReason.textContent = 'A ISO é isohybrid - cópia crua preserva boot original (BIOS + UEFI com GPT)';
    rawRadio.disabled = false;
    chainloadRadio.disabled = true;
    chainloadRadio.checked = false;
    rawRadio.checked = true;
    updateRawReason();
    updateChainloadReason();
    buildBtn.textContent = 'Gerar Imagem .img (modo RAW - isohybrid)';
    buildBtn.disabled = false;
    return;
  }

  if (info.boot.chainloadEntry) {
    rawReason.textContent = 'ISO não-híbrida com entrada El Torito no-emulation';
    chainloadReason.textContent = 'Será criado MBR de chainload para boot BIOS legado';
    rawRadio.disabled = false;
    chainloadRadio.disabled = false;
    rawRadio.checked = true;
    chainloadRadio.checked = false;
    updateRawReason();
    updateChainloadReason();
    buildBtn.textContent = 'Gerar Imagem .img';
    buildBtn.disabled = false;
    return;
  }

  // Default: no chainload entry available
  rawReason.textContent = 'ISO sem entrada El Torito "no emulation" - somente modo RAW (boot CD/DVD)';
  chainloadReason.textContent = 'Não disponível - usar modo RAW ou ferramenta externa (Rufus/Etcher)';
  rawRadio.disabled = false;
  chainloadRadio.disabled = true;
  chainloadRadio.checked = false;
  rawRadio.checked = true;
  updateRawReason();
  updateChainloadReason();
  buildBtn.textContent = 'Gerar Imagem .img (modo RAW)';
  buildBtn.disabled = true;
}

// Build Mode Selection
buildModeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'raw') {
      buildBtn.textContent = 'Gerar Imagem .img (modo RAW)';
    } else {
      buildBtn.textContent = 'Gerar Imagem .img (modo Chainload)';
    }
  });
});

// Build Image
buildBtn.addEventListener('click', async () => {
  if (!isoInfo) return;

  const mode = document.querySelector('input[name="buildMode"]:checked').value;
  const padToMiB = padToMiBCheck.checked;

  showSection('warningsPanel', false);
  showSection('downloadArea', false);
  buildBtn.disabled = true;
  buildBtn.textContent = 'Processando...';

  try {
    const options = { mode, padToMiB };
    builtBlob = await buildImage(new Blob([await isoInput.files[0].arrayBuffer()]), isoInfo, options);
    builtMode = options.mode;
    builtFilename = builtBlob.filename;

    // Show warnings
    if (builtBlob.warnings.length > 0) {
      showSection('warningsPanel', true);
      warningsList.innerHTML = builtBlob.warnings.map(w => `<li>⚠️ ${w}</li>`).join('');
    } else {
      showSection('warningsPanel', false);
    }

    // Show download area
    fileInfo.textContent = `Arquivo: ${builtFilename} (${(builtBlob.size / (1024*1024)).toFixed(2)} MiB)`;
    downloadBtn.disabled = false;
    showSection('downloadArea', true);

    buildBtn.textContent = 'Gerar Imagem .img';

  } catch (error) {
    alert('Erro ao gerar imagem: ' + error.message);
    console.error(error);
    buildBtn.disabled = false;
    buildBtn.textContent = 'Gerar Imagem .img';
  }
});

// Download
downloadBtn.addEventListener('click', () => {
  if (!builtBlob) return;

  const url = URL.createObjectURL(builtBlob.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = builtFilename;
  a.textContent = 'Download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Initial state
showSection('resultsArea', false);
showSection('uploadArea', true);
buildBtn.disabled = true;
downloadBtn.disabled = true;