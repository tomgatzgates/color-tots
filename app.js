// DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.querySelector('.close');
const saveSettingsBtn = document.getElementById('saveSettings');
const generateShareLinkBtn = document.getElementById('generateShareLink');
const googleApiTokenInput = document.getElementById('googleApiToken');
const openaiApiTokenInput = document.getElementById('openaiApiToken');
const pageSizeSelect = document.getElementById('pageSize');
const orientationSelect = document.getElementById('orientation');
const modelSelect = document.getElementById('modelSelect');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const imageSection = document.getElementById('imageSection');
const generatedImage = document.getElementById('generatedImage');
const printBtn = document.getElementById('printBtn');
const newBtn = document.getElementById('newBtn');
const errorMsg = document.getElementById('errorMsg');

// Theme Management DOM Elements
const contentThemeSelect = document.getElementById('contentThemeSelect');
const styleTagsContainer = document.getElementById('styleTagsContainer');
const manageThemesBtn = document.getElementById('manageThemesBtn');
const themesModal = document.getElementById('themesModal');
const closeThemesModal = document.getElementById('closeThemesModal');
const editThemeModal = document.getElementById('editThemeModal');
const closeEditThemeModal = document.getElementById('closeEditThemeModal');
const builtinThemesList = document.getElementById('builtinThemesList');
const customThemesList = document.getElementById('customThemesList');
const createThemeBtn = document.getElementById('createThemeBtn');
const themeName = document.getElementById('themeName');
const themeDescription = document.getElementById('themeDescription');
const themePrompt = document.getElementById('themePrompt');
const saveTheme = document.getElementById('saveTheme');
const cancelEditTheme = document.getElementById('cancelEditTheme');
const editThemeTitle = document.getElementById('editThemeTitle');

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `Create a cute, child-friendly coloring book illustration.
Rules:
- Line art style.
- Thick, smooth black outlines only.
- No border around the image.
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

// Theme management state
let editingThemeId = null;

// Get active content theme ID
function getActiveContentThemeId() {
    return localStorage.getItem('selected_content_theme_id') || DEFAULT_CONTENT_THEME_ID;
}

// Set active content theme
function setActiveContentTheme(id) {
    localStorage.setItem('selected_content_theme_id', id);
    contentThemeSelect.value = id;
}

// Get active style tags
function getActiveStyleTags() {
    const stored = localStorage.getItem('active_style_tags');
    return stored ? JSON.parse(stored) : DEFAULT_STYLE_TAGS;
}

// Set active style tags
function setActiveStyleTags(tags) {
    localStorage.setItem('active_style_tags', JSON.stringify(tags));
}

// Toggle style tag
function toggleStyleTag(tagId) {
    const activeTags = getActiveStyleTags();
    const index = activeTags.indexOf(tagId);

    if (index > -1) {
        // Remove tag
        activeTags.splice(index, 1);
    } else {
        // Add tag
        activeTags.push(tagId);
    }

    setActiveStyleTags(activeTags);
    renderStyleTags();
}

// Populate content theme dropdown
function populateContentThemeSelect() {
    const themes = getAllContentThemes();
    const activeId = getActiveContentThemeId();

    contentThemeSelect.innerHTML = '';

    // Group by built-in and custom
    const builtinOptgroup = document.createElement('optgroup');
    builtinOptgroup.label = 'Built-in Themes';

    const customOptgroup = document.createElement('optgroup');
    customOptgroup.label = 'Your Custom Themes';

    let hasCustom = false;

    themes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.id;
        option.textContent = theme.name;

        if (theme.isBuiltIn) {
            builtinOptgroup.appendChild(option);
        } else {
            customOptgroup.appendChild(option);
            hasCustom = true;
        }
    });

    contentThemeSelect.appendChild(builtinOptgroup);
    if (hasCustom) {
        contentThemeSelect.appendChild(customOptgroup);
    }

    contentThemeSelect.value = activeId;
}

// Render style tag chips
function renderStyleTags() {
    const activeTags = getActiveStyleTags();

    styleTagsContainer.innerHTML = BUILTIN_STYLE_TAGS.map(tag => {
        const isActive = activeTags.includes(tag.id);
        return `
            <button
                class="style-tag-chip ${isActive ? 'active' : ''}"
                onclick="toggleStyleTag('${tag.id}')"
                title="${tag.description}"
            >
                ${tag.emoji} ${tag.name}
            </button>
        `;
    }).join('');
}

// Handle content theme selection change
contentThemeSelect.addEventListener('change', () => {
    setActiveContentTheme(contentThemeSelect.value);
    showMessage('Theme switched!', 'success');
});

// Show themes management modal
manageThemesBtn.addEventListener('click', () => {
    renderThemesModal();
    themesModal.classList.add('show');
});

// Close theme modals
closeThemesModal.addEventListener('click', () => {
    themesModal.classList.remove('show');
});

closeEditThemeModal.addEventListener('click', () => {
    editThemeModal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === themesModal) {
        themesModal.classList.remove('show');
    }
    if (e.target === editThemeModal) {
        editThemeModal.classList.remove('show');
    }
});

// Render themes in management modal
function renderThemesModal() {
    const customThemes = loadCustomContentThemes();
    const activeId = getActiveContentThemeId();

    // Render built-in themes
    builtinThemesList.innerHTML = BUILTIN_CONTENT_THEMES.map(theme => `
        <div class="theme-item ${theme.id === activeId ? 'active' : ''}">
            <div class="theme-info">
                <h4>${theme.name}</h4>
                <p>${theme.description}</p>
            </div>
            <div class="theme-actions">
                <button class="use-btn" onclick="useTheme('${theme.id}')">
                    ${theme.id === activeId ? '✓ Active' : 'Use'}
                </button>
                <button class="duplicate-btn" onclick="duplicateTheme('${theme.id}')" title="Duplicate">
                    📋
                </button>
            </div>
        </div>
    `).join('');

    // Render custom themes
    if (customThemes.length === 0) {
        customThemesList.innerHTML = '<p style="color: #666; font-style: italic;">No custom themes yet. Create your first one!</p>';
    } else {
        customThemesList.innerHTML = customThemes.map(theme => `
            <div class="theme-item ${theme.id === activeId ? 'active' : ''}">
                <div class="theme-info">
                    <h4>${theme.name}</h4>
                    <p>${theme.description || 'Custom theme'}</p>
                </div>
                <div class="theme-actions">
                    <button class="use-btn" onclick="useTheme('${theme.id}')">
                        ${theme.id === activeId ? '✓ Active' : 'Use'}
                    </button>
                    <button class="edit-btn" onclick="editTheme('${theme.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteTheme('${theme.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// Use theme (set as active)
window.useTheme = function(id) {
    setActiveContentTheme(id);
    populateContentThemeSelect();
    renderThemesModal();
    showMessage('Theme activated!', 'success');
};

// Create new theme
createThemeBtn.addEventListener('click', () => {
    editingThemeId = null;
    editThemeTitle.textContent = 'Create New Theme';
    themeName.value = '';
    themeDescription.value = '';
    themePrompt.value = '';

    themesModal.classList.remove('show');
    editThemeModal.classList.add('show');
});

// Edit theme
window.editTheme = function(id) {
    const theme = getContentThemeById(id);
    if (!theme || theme.isBuiltIn) return;

    editingThemeId = id;
    editThemeTitle.textContent = 'Edit Theme';
    themeName.value = theme.name;
    themeDescription.value = theme.description || '';
    themePrompt.value = theme.prompt;

    themesModal.classList.remove('show');
    editThemeModal.classList.add('show');
};

// Duplicate theme
window.duplicateTheme = function(id) {
    const theme = getContentThemeById(id);
    if (!theme) return;

    editingThemeId = null;
    editThemeTitle.textContent = 'Create Theme (from ' + theme.name + ')';
    themeName.value = theme.name + ' (Copy)';
    themeDescription.value = theme.description || '';
    themePrompt.value = theme.prompt;

    themesModal.classList.remove('show');
    editThemeModal.classList.add('show');
};

// Save theme
saveTheme.addEventListener('click', () => {
    const name = themeName.value.trim();
    const description = themeDescription.value.trim();
    const prompt = themePrompt.value.trim();

    if (!name) {
        showMessage('Please enter a theme name!');
        return;
    }

    if (!prompt) {
        showMessage('Please enter a prompt!');
        return;
    }

    const customThemes = loadCustomContentThemes();

    if (editingThemeId) {
        // Edit existing
        const index = customThemes.findIndex(t => t.id === editingThemeId);
        if (index !== -1) {
            customThemes[index] = {
                ...customThemes[index],
                name,
                description,
                prompt
            };
        }
    } else {
        // Create new
        const newTheme = {
            id: 'custom-' + Date.now(),
            name,
            description,
            prompt,
            isBuiltIn: false
        };
        customThemes.push(newTheme);
    }

    saveCustomContentThemes(customThemes);
    populateContentThemeSelect();

    editThemeModal.classList.remove('show');
    themesModal.classList.add('show');
    renderThemesModal();

    showMessage(editingThemeId ? 'Theme updated!' : 'Theme created!', 'success');
});

// Cancel edit
cancelEditTheme.addEventListener('click', () => {
    editThemeModal.classList.remove('show');
    themesModal.classList.add('show');
});

// Delete theme
window.deleteTheme = function(id) {
    const theme = getContentThemeById(id);
    if (!theme || theme.isBuiltIn) return;

    const confirmed = confirm(`Delete theme "${theme.name}"?\n\nThis cannot be undone.`);
    if (!confirmed) return;

    const customThemes = loadCustomContentThemes();
    const filtered = customThemes.filter(t => t.id !== id);
    saveCustomContentThemes(filtered);

    // If deleting active theme, switch to default
    if (getActiveContentThemeId() === id) {
        setActiveContentTheme(DEFAULT_CONTENT_THEME_ID);
    }

    populateContentThemeSelect();
    renderThemesModal();
    showMessage('Theme deleted!', 'success');
};

// Make toggleStyleTag available globally
window.toggleStyleTag = toggleStyleTag;

// Migrate old API key storage format to new
function migrateApiKeys() {
    const oldKey = localStorage.getItem('gemini_api_key');
    if (oldKey && !localStorage.getItem('google_api_key')) {
        localStorage.setItem('google_api_key', oldKey);
        localStorage.removeItem('gemini_api_key');
        console.log('Migrated API key to new storage format');
    }
}

// Load saved settings
function loadSettings() {
    const googleToken = localStorage.getItem('google_api_key');
    const openaiToken = localStorage.getItem('openai_api_key');
    const pageSize = localStorage.getItem('page_size') || 'a4';
    const orientation = localStorage.getItem('orientation') || 'landscape';
    const model = localStorage.getItem('selected_model') || DEFAULT_MODEL;

    if (googleToken) {
        googleApiTokenInput.value = googleToken;
    }
    if (openaiToken) {
        openaiApiTokenInput.value = openaiToken;
    }
    pageSizeSelect.value = pageSize;
    orientationSelect.value = orientation;
    modelSelect.value = model;
}

// Save settings
function saveSettings() {
    const googleToken = googleApiTokenInput.value.trim();
    const openaiToken = openaiApiTokenInput.value.trim();
    const pageSize = pageSizeSelect.value;
    const orientation = orientationSelect.value;
    const model = modelSelect.value;

    if (googleToken) {
        localStorage.setItem('google_api_key', googleToken);
    }
    if (openaiToken) {
        localStorage.setItem('openai_api_key', openaiToken);
    }
    localStorage.setItem('page_size', pageSize);
    localStorage.setItem('orientation', orientation);
    localStorage.setItem('selected_model', model);

    settingsModal.classList.remove('show');
    showMessage('Settings saved!', 'success');
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
    const googleKey = googleApiTokenInput.value.trim();
    const openaiKey = openaiApiTokenInput.value.trim();

    if (!googleKey && !openaiKey) {
        showMessage('Please enter at least one API key first! 🔑');
        return;
    }

    // Show security warning
    const keyTypes = [];
    if (googleKey) keyTypes.push('Google');
    if (openaiKey) keyTypes.push('OpenAI');

    const confirmed = confirm(
        '⚠️ SECURITY WARNING ⚠️\n\n' +
        `Sharing this link will expose your ${keyTypes.join(' and ')} API key(s) to anyone who receives it.\n\n` +
        'Risks:\n' +
        '• Anyone with this link can use your API key(s)\n' +
        '• All usage will be charged to your account\n' +
        '• The key(s) may be visible in browser history\n' +
        '• If forwarded, your key(s) could spread further\n\n' +
        'Only share this link with trusted friends or family!\n\n' +
        'Do you want to continue?'
    );

    if (!confirmed) {
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const hashParams = [];
    if (googleKey) hashParams.push(`gkey=${encodeURIComponent(googleKey)}`);
    if (openaiKey) hashParams.push(`okey=${encodeURIComponent(openaiKey)}`);
    const shareUrl = `${baseUrl}#${hashParams.join('&')}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        settingsModal.classList.remove('show');
        showMessage('Link with embedded API key(s) copied to clipboard.', 'success');
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
    const modelKey = localStorage.getItem('selected_model') || DEFAULT_MODEL;
    const prompt = promptInput.value.trim();
    const orientation = localStorage.getItem('orientation') || 'landscape';

    // Get model config to determine provider
    const modelConfig = ModelRegistry[modelKey];
    if (!modelConfig) {
        showMessage('Invalid model selected! 😢');
        return;
    }

    // Select correct API key based on provider
    let apiKey;
    if (modelConfig.provider === 'google') {
        apiKey = localStorage.getItem('google_api_key');
        if (!apiKey) {
            showMessage('Please set your Google API key in settings first! ⚙️');
            return;
        }
    } else if (modelConfig.provider === 'openai') {
        apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            showMessage('Please set your OpenAI API key in settings first! ⚙️');
            return;
        }
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
        // Build full prompt using composable themes
        const contentThemeId = getActiveContentThemeId();
        const activeStyleTags = getActiveStyleTags();
        const systemPrompt = composePrompt(contentThemeId, activeStyleTags);
        const fullPrompt = `${systemPrompt}\n\n<image_description>${prompt}</image_description>`;

        // Determine aspect ratio (for Google models)
        const aspectRatio = orientation === 'landscape' ? '16:9' : '9:16';

        // Create adapter and generate
        const adapter = createModelAdapter(modelKey, apiKey);
        const result = await adapter.generate(fullPrompt, {
            aspectRatio,  // Used by Google models
            orientation    // Used by OpenAI models (future enhancement)
        });

        // Display image
        const imageUrl = `data:${result.mimeType};base64,${result.imageBase64}`;
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
    if (!hash) return false;

    let keysLoaded = false;

    // Support new format: #gkey=...&okey=...
    if (hash.includes('gkey=') || hash.includes('okey=')) {
        const params = new URLSearchParams(hash.substring(1));
        const googleKey = params.get('gkey');
        const openaiKey = params.get('okey');

        if (googleKey) {
            localStorage.setItem('google_api_key', decodeURIComponent(googleKey));
            keysLoaded = true;
        }
        if (openaiKey) {
            localStorage.setItem('openai_api_key', decodeURIComponent(openaiKey));
            keysLoaded = true;
        }

        if (keysLoaded) {
            // Clear the hash from URL for privacy
            history.replaceState(null, null, ' ');
            const keyTypes = [];
            if (googleKey) keyTypes.push('Google');
            if (openaiKey) keyTypes.push('OpenAI');
            showMessage(`${keyTypes.join(' and ')} API key(s) loaded from shared link! 🎉`, 'success');
            return true;
        }
    }
    // Support legacy format: #key=... (treat as Google key)
    else if (hash.startsWith('#key=')) {
        const key = hash.substring(5); // Remove '#key='
        if (key) {
            localStorage.setItem('google_api_key', decodeURIComponent(key));
            // Clear the hash from URL for privacy
            history.replaceState(null, null, ' ');
            showMessage('Google API key loaded from shared link! 🎉', 'success');
            return true;
        }
    }

    return false;
}

// Migrate existing system prompt to custom theme
function migrateSystemPromptToTheme() {
    // Check if user has a custom system prompt and hasn't been migrated yet
    const customPrompt = localStorage.getItem('system_prompt');
    const customThemes = loadCustomContentThemes();
    const hasMigrated = localStorage.getItem('prompt_migrated');

    if (customPrompt && customThemes.length === 0 && !hasMigrated) {
        // Check if it's different from the default
        const isCustom = customPrompt !== DEFAULT_SYSTEM_PROMPT;

        if (isCustom) {
            // Create a custom theme from their prompt
            const migratedTheme = {
                id: 'custom-migrated',
                name: 'My Custom Prompt',
                description: 'Migrated from your previous settings',
                prompt: customPrompt,
                isBuiltIn: false
            };

            customThemes.push(migratedTheme);
            saveCustomContentThemes(customThemes);

            // Set it as active
            localStorage.setItem('selected_content_theme_id', 'custom-migrated');
        }

        localStorage.setItem('prompt_migrated', 'true');
    }
}

// Initialize themes
function initializeThemes() {
    // Migrate old system prompt first
    migrateSystemPromptToTheme();

    // Populate UI
    populateContentThemeSelect();
    renderStyleTags();
}

// Initialize
checkUrlHash();
migrateApiKeys();
loadSettings();
initializeThemes();
createStars();

// Check if API key exists, if not show settings
const hasGoogleKey = localStorage.getItem('google_api_key');
const hasOpenAIKey = localStorage.getItem('openai_api_key');
if (!hasGoogleKey && !hasOpenAIKey) {
    setTimeout(() => {
        settingsModal.classList.add('show');
        showMessage('Welcome! Please enter an API key to get started 🚀', 'success');
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
