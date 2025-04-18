<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Editor</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Image Editor</h1>
        </header>
        <main>
            <section id="upload-preview">
                <input type="file" id="image-upload" accept="image/jpeg, image/png, image/jpg">
                <label for="image-upload" class="upload-button">Upload Image</label>
                <div id="image-preview-container">
                </div>
            </section>

            <section id="tools">
                <h2>Tools</h2>
                <div class="tool-group basic-operations">
                    <h3>Basic Operations</h3>
                    <div class="controls">
                        <div class="resize-controls">
                            <label for="width">Width:</label>
                            <input type="number" id="width" placeholder="Auto">
                            <label for="height">Height:</label>
                            <input type="number" id="height" placeholder="Auto">
                            <button id="resize-button">Resize</button>
                        </div>
                        <div class="rotate-controls">
                            <button id="rotate-left">Rotate Left</button>
                            <button id="rotate-right">Rotate Right</button>
                            <label for="rotate-angle">Angle:</label>
                            <input type="number" id="rotate-angle" placeholder="Degrees">
                            <button id="rotate-custom">Rotate</button>
                        </div>
                        <div class="crop-controls">
                            <button id="enable-crop">Enable Crop</button>
                            <button id="apply-crop">Apply Crop</button>
                        </div>
                        <div class="flip-controls">
                            <button id="flip-horizontal">Flip Horizontal</button>
                            <button id="flip-vertical">Flip Vertical</button>
                        </div>
                    </div>
                </div>

                <div class="tool-group color-filters">
                    <h3>Color & Filter Adjustments</h3>
                    <div class="controls">
                        <div class="slider-control">
                            <label for="brightness">Brightness:</label>
                            <input type="range" id="brightness" min="0" max="200" value="100">
                            <span id="brightness-value">100%</span>
                        </div>
                        <div class="slider-control">
                            <label for="contrast">Contrast:</label>
                            <input type="range" id="contrast" min="0" max="200" value="100">
                            <span id="contrast-value">100%</span>
                        </div>
                        <button id="grayscale">Grayscale</button>
                        <button id="sepia">Sepia</button>
                        <button id="reset-filters">Reset Filters</button>
                    </div>
                </div>

                <div class="tool-group enhancement-effects">
                    <h3>Enhancement & Effects</h3>
                    <div class="controls">
                        <div class="slider-control">
                            <label for="blur">Blur:</label>
                            <input type="range" id="blur" min="0" max="10" value="0">
                            <span id="blur-value">0px</span>
                        </div>
                        <button id="sharpen">Sharpen</button>
                        <button id="edge-detect">Edge Detection</button>
                        <div class="dropdown-control">
                            <label for="artistic-filter">Artistic Filter:</label>
                            <select id="artistic-filter">
                                <option value="">None</option>
                                <option value="sketch">Sketch</option>
                                <option value="cartoon">Cartoon</option>
                                <option value="oil-paint">Oil Paint</option>
                            </select>
                            <button id="apply-filter">Apply</button>
                        </div>
                    </div>
                </div>

                <div class="tool-group file-handling">
                    <h3>File Handling & Export</h3>
                    <div class="controls">
                        <button id="save-button">Save/Download</button>
                        <button id="undo-button" disabled>Undo</button>
                        <button id="redo-button" disabled>Redo</button>
                        <button id="reset-all-button">Reset All</button>
                        <label for="export-format">Export As:</label>
                        <select id="export-format">
                            <option value="png">PNG</option>
                            <option value="jpg">JPG</option>
                            <option value="webp">WEBP</option>
                        </select>
                    </div>
