const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
let canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let currentImage = null;
const undoStack = [];
const redoStack = [];

function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack.length = 0; // Clear redo stack on new action
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    document.getElementById('undo-button').disabled = undoStack.length === 0;
    document.getElementById('redo-button').disabled = redoStack.length === 0;
}

function loadImage(src) {
    console.log("loadImage called with src:", src); // Added log
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            console.log("Image loaded successfully"); // Added log
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            currentImage = img;
            imagePreviewContainer.innerHTML = ''; // Clear any previous content
            imagePreviewContainer.appendChild(canvas); // Append the canvas to the preview container
            resolve();
            saveState();
        };
        img.onerror = (error) => {
            console.error("Error loading image:", error); // Added log
            reject(error);
        };
        img.src = src;
    });
}

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log("FileReader onload triggered with result:", e.target.result); // Added log
            loadImage(e.target.result);
        };
        reader.onerror = (error) => {
            console.error("FileReader error:", error); // Added log
        };
        reader.readAsDataURL(file);
        console.log("FileReader started reading"); // Added log
    } else {
        console.log("No file selected"); // Added log
    }
});

// --- Basic Image Operations ---
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizeButton = document.getElementById('resize-button');

resizeButton.addEventListener('click', () => {
    if (!currentImage) return;
    const newWidth = widthInput.value ? parseInt(widthInput.value) : currentImage.width;
    const newHeight = heightInput.value ? parseInt(heightInput.value) : currentImage.height;

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(currentImage, 0, 0, currentImage.width, currentImage.height, 0, 0, newWidth, newHeight);
    saveState();
});

const rotateLeftButton = document.getElementById('rotate-left');
const rotateRightButton = document.getElementById('rotate-right');
const rotateAngleInput = document.getElementById('rotate-angle');
const rotateCustomButton = document.getElementById('rotate-custom');

function rotateImage(angleInDegrees) {
    if (!currentImage) return;
    const angleInRadians = angleInDegrees * Math.PI / 180;
    const newWidth = Math.abs(Math.cos(angleInRadians) * canvas.width) + Math.abs(Math.sin(angleInRadians) * canvas.height);
    const newHeight = Math.abs(Math.sin(angleInRadians) * canvas.width) + Math.abs(Math.cos(angleInRadians) * canvas.height);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;

    tempCtx.translate(newWidth / 2, newHeight / 2);
    tempCtx.rotate(angleInRadians);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(tempCanvas, 0, 0);
    saveState();
});

rotateLeftButton.addEventListener('click', () => rotateImage(-90));
rotateRightButton.addEventListener('click', () => rotateImage(90));
rotateCustomButton.addEventListener('click', () => {
    const angle = parseInt(rotateAngleInput.value) || 0;
    rotateImage(angle);
});

// --- Color and Filter Adjustments ---
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const brightnessValueSpan = document.getElementById('brightness-value');
const contrastValueSpan = document.getElementById('contrast-value');
const grayscaleButton = document.getElementById('grayscale');
const sepiaButton = document.getElementById('sepia');
const resetFiltersButton = document.getElementById('reset-filters');

function applyFilters() {
    if (!currentImage) return;
    ctx.drawImage(currentImage, 0, 0); // Redraw original image
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const brightnessFactor = parseFloat(brightnessSlider.value) / 100;
    const contrastFactor = (parseFloat(contrastSlider.value) / 100 + 1) ** 2;

    for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] = data[i] * brightnessFactor;
        data[i + 1] = data[i + 1] * brightnessFactor;
        data[i + 2] = data[i + 2] * brightnessFactor;

        // Contrast
        const r = data[i] / 255 - 0.5;
        const g = data[i + 1] / 255 - 0.5;
        const b = data[i + 2] / 255 - 0.5;

        data[i] = (r * contrastFactor + 0.5) * 255;
        data[i + 1] = (g * contrastFactor + 0.5) * 255;
        data[i + 2] = (b * contrastFactor + 0.5) * 255;
    }
    ctx.putImageData(imageData, 0, 0);
    saveState();
}

brightnessSlider.addEventListener('input', () => {
    brightnessValueSpan.textContent = brightnessSlider.value + '%';
    applyFilters();
});

contrastSlider.addEventListener('input', () => {
    contrastValueSpan.textContent = contrastSlider.value + '%';
    applyFilters();
});

grayscaleButton.addEventListener('click', () => {
    if (!currentImage) return;
    ctx.drawImage(currentImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
    saveState();
});

sepiaButton.addEventListener('click', () => {
    if (!currentImage) return;
    ctx.drawImage(currentImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
    }
    ctx.putImageData(imageData, 0, 0);
    saveState();
});

resetFiltersButton.addEventListener('click', () => {
    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0);
        brightnessSlider.value = 100;
        contrastSlider.value = 100;
        brightnessValueSpan.textContent = '100%';
        contrastValueSpan.textContent = '100%';
        saveState();
    }
});

// --- Image Enhancement & Effects ---
const blurSlider = document.getElementById('blur');
const blurValueSpan = document.getElementById('blur-value');
const sharpenButton = document.getElementById('sharpen');
const edgeDetectButton = document.getElementById('edge-detect');
const artisticFilterSelect = document.getElementById('artistic-filter');
const applyFilterButton = document.getElementById('apply-filter');

function applyBlur() {
    if (!currentImage) return;
    const blurRadius = parseInt(blurSlider.value);
    if (blurRadius === 0) {
        ctx.drawImage(currentImage, 0, 0);
    } else {
        // Basic box blur (for simplicity - Gaussian blur is better for quality)
        const kernelSize = blurRadius * 2 + 1;
        const weight = 1 / (kernelSize * kernelSize);
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const blurredData = ctx.createImageData(canvas.width, canvas.height);
        const blurred = blurredData.data;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                for (let ky = -blurRadius; ky <= blurRadius; ky++) {
                    for (let kx = -blurRadius; kx <= blurRadius; kx++) {
                        const pixelX = Math.min(canvas.width - 1, Math.max(0, x + kx));
                        const pixelY = Math.min(canvas.height - 1, Math.max(0, y + ky));
                        const offset = (pixelY * canvas.width + pixelX) * 4;
                        r += data[offset];
                        g += data[offset + 1];
                        b += data[offset + 2];
                        a += data[offset + 3];
                    }
                }
                const offset = (y * canvas.width + x) * 4;
                blurred[offset] = r * weight;
                blurred[offset + 1] = g * weight;
                blurred[offset + 2] = b * weight;
                blurred[offset + 3] = a;
            }
        }
        ctx.putImageData(blurredData, 0, 0);
    }
    saveState();
}

blurSlider.addEventListener('input', () => {
    blurValueSpan.textContent = blurSlider.value + 'px';
    applyBlur();
});

sharpenButton.addEventListener('click', () => {
    if (!currentImage) return;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const sharpenedData = ctx.createImageData(canvas.width, canvas.height);
    const sharpened = sharpenedData.data;
    const kernel = [
        -1, -1, -1,
        -1,  9, -1,
        -1, -1, -1
    ];
    const kernelWeight = 1; // For this kernel

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelX = Math.min(canvas.width - 1, Math.max(0, x + kx));
                    const pixelY = Math.min(canvas.height - 1, Math.max(0, y + ky));
                    const offset = (pixelY * canvas.width + pixelX) * 4;
                    const weight = kernel[(ky + 1) * 3 + (kx + 1)];
                    r += data[offset] * weight;
                    g += data[offset + 1] * weight;
                    b += data[offset + 2] * weight;
                    a += data[offset + 3];
                }
            }
            const offset = (y * canvas.width + x) * 4;
            sharpened[offset] = Math.min(255, Math.max(0, r * kernelWeight));
            sharpened[offset + 1] = Math.min(255, Math.max(0, g * kernelWeight));
            sharpened[offset + 2] = Math.min(255, Math.max(0, b * kernelWeight));
            sharpened[offset + 3] = a;
        }
    }
    ctx.putImageData(sharpenedData, 0, 0);
    saveState();
});

// Basic edge detection (Sobel operator - simplified)
edgeDetectButton.addEventListener('click', () => {
    if (!currentImage) return;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const edgesData = ctx.createImageData(canvas.width, canvas.height);
    const edges = edgesData.data;
    const grayscale = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            const offset = (y * canvas.width + x) * 4;
            const gray = grayscale(data[offset], data[offset + 1], data[offset + 2]);

            let gx = (grayscale(data[(y - 1) * canvas.width + (x - 1)] * 4, data[(y - 1) * canvas.width + (x - 1)] * 4 + 1, data[(y - 1) * canvas.width + (x - 1)] * 4 + 2) * -1) +
                     (grayscale(data[(y - 1) * canvas.width + (x + 1)] * 4, data[(y - 1) * canvas.width + (x + 1)] * 4 + 1, data[(y - 1) * canvas.width + (x + 1)] * 4 + 2) * 1) +
                     (grayscale(data[y * canvas.width + (x - 1)] * 4, data[y * canvas.width + (x - 1)] * 4 + 1, data[y * canvas.width + (x - 1)] * 4 + 2) * -2) +
                     (grayscale(data[y * canvas.width + (x + 1)] * 4, data[y * canvas.width + (x + 1)] * 4 + 1, data[y * canvas.width + (x + 1)] * 4 + 2) * 2)
