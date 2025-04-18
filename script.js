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
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            currentImage = img;
            imagePreviewContainer.innerHTML = ''; // Clear any previous content
            imagePreviewContainer.appendChild(canvas); // Append the canvas to the preview container
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

// ... (rest of your JavaScript code for other tools will go here)
