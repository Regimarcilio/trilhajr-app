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
const testBootBtn = document.getElementById('testBootBtn');
const bootResult = document.getElementById('bootResult');
const bootResultText = document.getElementById('bootResultText');
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
let v86WasmLoaded = false;

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

// Build Image
buildBtn.addEventListener('click', async () => {
  if (!isoInfo) return;

  const mode = document.querySelector('input[name="buildMode"]:checked').value;
  const padToMiB = padToMiBCheck.checked;

  showSection('warningsPanel', false);
  showSection('downloadArea', false);
  showSection('bootArea', false);
  testBootBtn.disabled = true;
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

    // Enable boot test button
    testBootBtn.disabled = false;
    testBootBtn.textContent = `Testar Boot (${builtMode})`;

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
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// === T006: Boot Test Integration ===

async function loadV86Wasm() {
  if (v86WasmLoaded) return;
  
  try {
    // Load the v86 WASM module
    await import('./vendor/v86/v86.wasm');
    v86WasmLoaded = true;
    
    // Load seabios.bin - need to read it as ArrayBuffer
    const seabiosResponse = await fetch('./vendor/v86/seabios.bin');
    const seabiosBuffer = await seabiosResponse.arrayBuffer();
    
    window.seabios = new Uint8Array(seabiosBuffer);
    console.log('v86 WASM and seabios loaded successfully');
  } catch (error) {
    console.error('Failed to load v86 resources:', error);
    showBootResult('Falha', 'Não foi possível carregar o emulador v86. Verifique se os arquivos vendor/v86/ estão disponíveis.', 'error');
  }
}

async function testBoot() {
  if (!builtBlob) {
    alert('Nenhuma imagem foi gerada ainda. Gere uma imagem primeiro.');
    return;
  }

  // Show loading state
  showBootResult('Carregando...', '', 'loading');
  testBootBtn.disabled = true;
  testBootBtn.textContent = 'Testando...';

  try {
    await loadV86Wasm();
    
    if (!v86WasmLoaded) throw new Error('v86 WASM não carregou');
    
    // Get the built blob and create a reference for v86
    const imgBlob = builtBlob.blob;
    const imgArrayBuffer = await imgBlob.arrayBuffer();
    
    // Create a synthetic ISO-like structure for v86
    // For chainload mode, we pass the built blob as hda
    // For raw mode, we set up CD-ROM
    
    const mode = builtMode;
    
    // Initialize v86 emulator
    const v86 = new window.V86({
      memory: 8 * 1024 * 1024, // 8MB
      bios: window.seabios,
      setup: imgArrayBuffer,  // The built .img as setup disk
      onSerialOutput: (byte) => {
        // Check for "OK" in serial output
        serialBuffer.push(byte);
        if (serialBuffer.length >= 2) {
          const recent = serialBuffer.slice(-2).join('');
          if (recent === 'OK') {
            showBootResult('SUCCESS', 'OK recebido na serial', 'success');
            testBootBtn.disabled = false;
            testBootBtn.textContent = 'Testar Boot';
          }
        }
      },
      onExit: () => {
        showBootResult('FAILED', 'Emulador encerrou antes de completar', 'error');
        testBootBtn.disabled = false;
        testBootBtn.textContent = 'Testar Boot';
      }
    });
    
    // Configure based on mode
    if (mode === 'chainload') {
      // Chainload: boot from hda (hard drive)
      v86.hd = {
        size: 512, // 512 sectors
        buffer: imgArrayBuffer
      };
      v86.boot('hda');
    } else {
      // Raw/CD-ROM mode
      v86.cdrom = {
        buffer: imgArrayBuffer,
        ejected: false
      };
      v86.boot('cdrom');
    }
    
    // Start the emulation
    v86.run();
    
    // Set timeout - if we don't get "OK" within 20 seconds, it's a failure
    const timeoutId = setTimeout(() => {
      v86.stop();
      showBootResult('FAILED', 'Timeout após 20s - "OK" não recebido na serial', 'error');
      testBootBtn.disabled = false;
      testBootBtn.textContent = 'Testar Boot';
    }, 20000);
    
    // Store timeout reference for cleanup
    testBootBtn._timeoutId = timeoutId;
    
  } catch (error) {
    console.error('Boot test error:', error);
    showBootResult('ERRO', error.message, 'error');
    testBootBtn.disabled = false;
    testBootBtn.textContent = 'Testar Boot';
  }
}

function showBootResult(status, message, type) {
  const modeInfo = builtMode === 'chainload' ? 'modo chainload' : 'modo raw';
  
  const statusClasses = {
    success: 'success',
    error: 'error', 
    loading: 'loading',
    fallback: 'fallback'
  };
  
  const typeStyles = {
    success: 'background: #4caf50; color: white; padding: 10px; border-radius: 4px; font-weight: bold;',
    error: 'background: #f44336; color: white; padding: 10px; border-radius: 4px; font-weight: bold;',
    loading: 'background: #ff9800; color: white; padding: 10x; border-radius: 4px; font-weight: bold;',
    fallback: 'background: #9c27b0; color: white; padding: 10px; border-radius: 4px; font-weight: bold;'
  };
  
  bootResult.style.cssText = typeStyles[type] || typeStyles.error;
  bootResultText.textContent = `${status} - ${modeInfo}: ${message}`;
  bootResult.style.display = 'block';
  
  // Auto-hide after 8 seconds for success/error, keep loading until manual
  if (type !== 'loading') {
    setTimeout(() => {
      bootResult.style.display = 'none';
    }, 8000);
  }
}

// Initialize serial buffer for OK detection
let serialBuffer = [];

// Wire up boot test button
testBootBtn.addEventListener('click', testBoot);

// Initial state setup
showSection('resultsArea', false);
showSection('uploadArea', true);
buildBtn.disabled = true;
downloadBtn.disabled = true;
testBootBtn.disabled = true;

// Hide boot result area initially
bootResult.style.display = 'none';