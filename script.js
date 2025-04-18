const imageUpload = document.getElementById('image-upload');
const uploadedImage = document.getElementById('uploaded-image');
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
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            currentImage = img;
            imagePreviewContainer.innerHTML = ''; // Clear previous image
            imagePreviewContainer.appendChild(canvas);
            resolve();
            saveState();
        };
        img.onerror = reject;
        img.src = src;
    });
}

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
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
}

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
    const imageData = ctx.getImageData(0, 0, canvas.width