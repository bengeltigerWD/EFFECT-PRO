// script.js
const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const controls = document.getElementById('controls');
const download = document.getElementById('download');
let img = new Image();
let currentTool = null;

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        img.src = event.target.result;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
    };
    
    reader.readAsDataURL(file);
});

document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const option = e.target.getAttribute('data-option');
        loadControls(option);
        currentTool = option;
    });
});

function loadControls(option) {
    controls.innerHTML = '';
    switch(option) {
        case 'canvas':
            controls.innerHTML = `
                <label>Resize Canvas</label>
                <input type="range" id="canvas-width" min="100" max="1000" value="${canvas.width}">
                <input type="range" id="canvas-height" min="100" max="1000" value="${canvas.height}">
            `;
            document.getElementById('canvas-width').addEventListener('input', resizeCanvas);
            document.getElementById('canvas-height').addEventListener('input', resizeCanvas);
            break;
        case 'filter':
            controls.innerHTML = `
                <label>Brightness</label>
                <input type="range" id="brightness" min="0" max="200" value="100">
                <label>Contrast</label>
                <input type="range" id="contrast" min="0" max="200" value="100">
                <label>Grayscale</label>
                <input type="range" id="grayscale" min="0" max="100" value="0">
            `;
            document.getElementById('brightness').addEventListener('input', applyFilters);
            document.getElementById('contrast').addEventListener('input', applyFilters);
            document.getElementById('grayscale').addEventListener('input', applyFilters);
            break;
        case 'adjust':
            controls.innerHTML = `
                <label>Hue</label>
                <input type="range" id="hue" min="0" max="360" value="0">
                <label>Saturation</label>
                <input type="range" id="saturation" min="0" max="200" value="100">
            `;
            document.getElementById('hue').addEventListener('input', applyAdjustments);
            document.getElementById('saturation').addEventListener('input', applyAdjustments);
            break;
        case 'effect':
            controls.innerHTML = `
                <label>Choose Effect</label>
                <select id="effect">
                    <option value="none">None</option>
                    <option value="sepia">Sepia</option>
                    <option value="invert">Invert</option>
                    <option value="blur">Blur</option>
                </select>
            `;
            document.getElementById('effect').addEventListener('change', applyEffect);
            break;
        case 'sticker':
            controls.innerHTML = `
                <label>Add Sticker</label>
                <input type="file" id="sticker-upload" accept="image/*">
            `;
            document.getElementById('sticker-upload').addEventListener('change', addSticker);
            break;
        case 'text':
            controls.innerHTML = `
                <label>Text</label>
                <input type="text" id="text-input" placeholder="Enter text">
                <label>Font Size</label>
                <input type="range" id="font-size" min="10" max="100" value="30">
                <label>Color</label>
                <input type="color" id="font-color" value="#ffffff">
                <button id="add-text">Add Text</button>
            `;
            document.getElementById('add-text').addEventListener('click', addText);
            break;
        case 'doodle':
            controls.innerHTML = `
                <label>Draw</label>
                <input type="color" id="doodle-color" value="#ff0000">
                <label>Brush Size</label>
                <input type="range" id="brush-size" min="1" max="20" value="5">
                <button id="clear-doodle">Clear</button>
            `;
            enableDoodle();
            document.getElementById('clear-doodle').addEventListener('click', clearDoodle);
            break;
        case 'crop':
            controls.innerHTML = `<label>Drag to crop</label>`;
            enableCrop();
            break;
        default:
            controls.innerHTML = '';
    }
}

function resizeCanvas() {
    const width = document.getElementById('canvas-width').value;
    const height = document.getElementById('canvas-height').value;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
}

function applyFilters() {
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;
    const grayscale = document.getElementById('grayscale').value;
    
    ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        grayscale(${grayscale}%)
    `;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function applyAdjustments() {
    const hue = document.getElementById('hue').value;
    const saturation = document.getElementById('saturation').value;

    ctx.filter = `
        hue-rotate(${hue}deg)
        saturate(${saturation}%)
    `;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function applyEffect() {
    const effect = document.getElementById('effect').value;

    switch(effect) {
        case 'sepia':
            ctx.filter = 'sepia(1)';
            break;
        case 'invert':
            ctx.filter = 'invert(1)';
            break;
        case 'blur':
            ctx.filter = 'blur(5px)';
            break;
        default:
            ctx.filter = 'none';
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function addSticker() {
    const file = document.getElementById('sticker-upload').files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const sticker = new Image();
        sticker.src = event.target.result;
        sticker.onload = () => {
            ctx.drawImage(sticker, canvas.width / 4, canvas.height / 4, 100, 100);
        };
    };
    
    reader.readAsDataURL(file);
}

function addText() {
    const text = document.getElementById('text-input').value;
    const fontSize = document.getElementById('font-size').value;
    const color = document.getElementById('font-color').value;
    
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, canvas.width / 4, canvas.height / 2);
}

function enableDoodle() {
    let drawing = false;

    canvas.onmousedown = () => { drawing = true; };
    canvas.onmouseup = () => { drawing = false; };
    canvas.onmousemove = (e) => {
        if (drawing) {
            const color = document.getElementById('doodle-color').value;
            const size = document.getElementById('brush-size').value;

            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';

            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        }
    };
}

function clearDoodle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function enableCrop() {
    // Implement cropping logic here
    // Use mouse events to allow the user to select an area of the canvas to crop
    // and then update the canvas size and content accordingly
}

download.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
