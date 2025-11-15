// DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.querySelector('.close');
const saveSettingsBtn = document.getElementById('saveSettings');
const generateShareLinkBtn = document.getElementById('generateShareLink');
const apiTokenInput = document.getElementById('apiToken');
const pageSizeSelect = document.getElementById('pageSize');
const orientationSelect = document.getElementById('orientation');
const systemPromptInput = document.getElementById('systemPrompt');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const imageSection = document.getElementById('imageSection');
const generatedImage = document.getElementById('generatedImage');
const printBtn = document.getElementById('printBtn');
const newBtn = document.getElementById('newBtn');
const errorMsg = document.getElementById('errorMsg');

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `Create a cute, child-friendly coloring book illustration.
Rules:
- Line art style.
- Thick, smooth black outlines only.
- No page border.
- No shading, gradients, or cross-hatching — pure white fill areas for coloring.
- Uniform line weight (slightly bold, consistent throughout).
- Clean, closed shapes with no sketchiness.

Character Rules (for vehicles like cars, trains, planes):
- Add one friendly face only.
- The face appears clearly on the front of the object.
- Exactly two eyes and one mouth.
- No other parts may resemble faces.
- No extra circles, dots, or shapes that could look like eyes or mouths.
- Windows, wheels, and small details should stay simple and neutral.

Scene Rules:
- Include a simple background with nature or buildings.
- Keep the environment cute and child-friendly.
- No realistic or complex details.
`;

// Load saved settings
function loadSettings() {
    const token = localStorage.getItem('gemini_api_key');
    const pageSize = localStorage.getItem('page_size') || 'a4';
    const orientation = localStorage.getItem('orientation') || 'landscape';
    const systemPrompt = localStorage.getItem('system_prompt') || DEFAULT_SYSTEM_PROMPT;

    if (token) {
        apiTokenInput.value = token;
    }
    pageSizeSelect.value = pageSize;
    orientationSelect.value = orientation;
    systemPromptInput.value = systemPrompt;
}

// Save settings
function saveSettings() {
    const token = apiTokenInput.value.trim();
    const pageSize = pageSizeSelect.value;
    const orientation = orientationSelect.value;
    const systemPrompt = systemPromptInput.value.trim();

    if (token) {
        localStorage.setItem('gemini_api_key', token);
    }
    localStorage.setItem('page_size', pageSize);
    localStorage.setItem('orientation', orientation);

    if (systemPrompt) {
        localStorage.setItem('system_prompt', systemPrompt);
    } else {
        localStorage.setItem('system_prompt', DEFAULT_SYSTEM_PROMPT);
    }

    settingsModal.classList.remove('show');
    showMessage('Settings saved! 🎉', 'success');
}

// Show/hide modal
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');
});

closeModal.addEventListener('click', () => {
    settingsModal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('show');
    }
});

saveSettingsBtn.addEventListener('click', saveSettings);

// Generate shareable link with API key
generateShareLinkBtn.addEventListener('click', () => {
    const key = apiTokenInput.value.trim();
    if (!key) {
        showMessage('Please enter an API key first! 🔑');
        return;
    }

    // Show security warning
    const confirmed = confirm(
        '⚠️ SECURITY WARNING ⚠️\n\n' +
        'Sharing this link will expose your API key to anyone who receives it.\n\n' +
        'Risks:\n' +
        '• Anyone with this link can use your API key\n' +
        '• All usage will be charged to your account\n' +
        '• The key may be visible in browser history\n' +
        '• If forwarded, your key could spread further\n\n' +
        'Only share this link with trusted friends or family!\n\n' +
        'Do you want to continue?'
    );

    if (!confirmed) {
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#key=${key}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        settingsModal.classList.remove('show');
        showMessage('Link with embedded API key copied to clipboard.', 'success');
    }).catch(() => {
        // Fallback if clipboard API fails
        settingsModal.classList.remove('show');
        alert(`Share this link:\n\n${shareUrl}`);
    });
});

// Show messages
function showMessage(message, type = 'error') {
    errorMsg.textContent = message;
    errorMsg.className = `error-msg ${type}`;
    errorMsg.classList.remove('hidden');

    if (type === 'success') {
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 3000);
    }
}

// Get page size dimensions for prompt
function getPageSizeDescription(size) {
    const sizes = {
        letter: 'Letter size (8.5x11 inches)',
        a4: 'A4 size (210x297mm)',
        poster: 'Large poster size (18x24 inches)'
    };
    return sizes[size] || sizes.letter;
}

// Generate coloring page
async function generateColoringPage() {
    const apiKey = localStorage.getItem('gemini_api_key');
    const prompt = promptInput.value.trim();
    const pageSize = localStorage.getItem('page_size') || 'a4';
    const orientation = localStorage.getItem('orientation') || 'landscape';

    // Validation
    if (!apiKey) {
        showMessage('Please set your Google Gemini API key in settings first! ⚙️');
        return;
    }

    if (!prompt) {
        showMessage('Please describe what you want to color! 🎨');
        return;
    }

    // Show loading
    errorMsg.classList.add('hidden');
    imageSection.classList.add('hidden');
    loading.classList.remove('hidden');
    generateBtn.disabled = true;

    try {
        const pageSizeDesc = getPageSizeDescription(pageSize);
        const systemPrompt = localStorage.getItem('system_prompt') || DEFAULT_SYSTEM_PROMPT;
        const fullPrompt = `${systemPrompt} <image_description>${prompt}</image_description>`;
        // Determine aspect ratio for Gemini
        const aspectRatio = orientation === 'landscape' ? '16:9' : '9:16';

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict`, {
            method: 'POST',
            headers: {
                'x-goog-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [
                    {
                        prompt: fullPrompt
                    }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: aspectRatio
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate image');
        }

        const data = await response.json();

        // Gemini returns base64 encoded images in predictions array
        if (!data.predictions || data.predictions.length === 0) {
            throw new Error('No image generated');
        }

        const imageBase64 = data.predictions[0].bytesBase64Encoded;
        const mimeType = data.predictions[0].mimeType || 'image/png';
        const imageUrl = `data:${mimeType};base64,${imageBase64}`;

        // Display image
        generatedImage.src = imageUrl;
        loading.classList.add('hidden');
        imageSection.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('hidden');
        showMessage(`Oops! Something went wrong: ${error.message} 😢`);
    } finally {
        generateBtn.disabled = false;
    }
}

// Print functionality
function printImage() {
    const printWindow = window.open('', '_blank');
    const pageSize = localStorage.getItem('page_size') || 'a4';
    const orientation = localStorage.getItem('orientation') || 'landscape';

    const pageStyles = {
        letter: orientation === 'landscape' ? 'width: 11in; height: 8.5in;' : 'width: 8.5in; height: 11in;',
        a4: orientation === 'landscape' ? 'width: 297mm; height: 210mm;' : 'width: 210mm; height: 297mm;',
        poster: orientation === 'landscape' ? 'width: 24in; height: 18in;' : 'width: 18in; height: 24in;'
    };

    printWindow.document.write(`
        <html>
            <head>
                <title>Color Tots - Coloring Page</title>
                <style>
                    @page {
                        margin: 0;
                        size: ${pageSize} ${orientation};
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        ${pageStyles[pageSize]}
                    }
                    img {
                        max-width: 100%;
                        max-height: 100%;
                        display: block;
                    }
                </style>
            </head>
            <body>
                <img src="${generatedImage.src}" alt="Coloring Page">
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
    };
}

// Create new image
function createNew() {
    imageSection.classList.add('hidden');
    promptInput.value = '';
    promptInput.focus();
}

// Event listeners
generateBtn.addEventListener('click', generateColoringPage);
printBtn.addEventListener('click', printImage);
newBtn.addEventListener('click', createNew);

promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateColoringPage();
    }
});

// Create animated stars background
function createStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 50;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${2 + Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }
}

// Check for API key in URL hash (for easy family sharing)
function checkUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#key=')) {
        const key = hash.substring(5); // Remove '#key='
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            // Clear the hash from URL for privacy
            history.replaceState(null, null, ' ');
            showMessage('API key loaded from shared link! 🎉', 'success');
            return true;
        }
    }
    return false;
}

// Initialize
checkUrlHash();
loadSettings();
createStars();

// Check if API key exists, if not show settings
if (!localStorage.getItem('gemini_api_key')) {
    setTimeout(() => {
        settingsModal.classList.add('show');
        showMessage('Welcome! Please enter your Google Gemini API key to get started 🚀', 'success');
    }, 500);
}

// Sparkly star trail on mouse move (desktop only)
if (window.innerWidth > 768) {
    let lastSparkleTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        // Throttle to every 50ms
        if (now - lastSparkleTime < 50) return;
        lastSparkleTime = now;

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${e.pageX}px`;
        sparkle.style.top = `${e.pageY}px`;

        // Random movement direction
        sparkle.style.setProperty('--random-x', (Math.random() - 0.5) * 2);
        sparkle.style.setProperty('--random-y', -20 - Math.random() * 30);

        // Random star characters
        const stars = ['✨', '⭐', '🌟', '💫', '⚡'];
        sparkle.textContent = stars[Math.floor(Math.random() * stars.length)];

        document.body.appendChild(sparkle);

        // Remove after animation completes
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    });
}
