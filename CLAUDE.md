# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Color Tots is a standalone single-page web application for generating AI-powered coloring pages for children. The app uses Google's Gemini Imagen API to create custom coloring book illustrations based on user prompts.

**Tech Stack:** Vanilla JavaScript, HTML, CSS (no build system or dependencies)

## Architecture

### Single-Page Application Structure

The application consists of four main files:
- `index.html` - DOM structure and layout
- `app.js` - Application logic and UI interactions
- `models.js` - Model configurations and API adapter pattern
- `app.css` - Complete styling including animations and responsive design
- `bin/start` - Development server script

### Key Application Components

**State Management:**
- All state is stored in `localStorage`:
  - `gemini_api_key` - User's Google Gemini API key
  - `selected_model` - Selected AI model (imagen-fast/imagen-standard/imagen-ultra)
  - `page_size` - Print page size (letter/a4/poster)
  - `orientation` - Print orientation (portrait/landscape)
  - `system_prompt` - Custom prompt instructions for image generation
- No external state management libraries

**API Integration:**
- Multi-model support via adapter pattern (models.js)
- Three Imagen 4 model tiers available:
  - **Fast**: imagen-4.0-fast-generate-001 ($0.02/image)
  - **Standard**: imagen-4.0-generate-001 ($0.04/image) - default
  - **Ultra**: imagen-4.0-ultra-generate-001 ($0.06/image)
- All models use Google Gemini Imagen API (v1beta) `:predict` endpoint
- Images returned as base64-encoded data in `predictions[0].bytesBase64Encoded`
- Aspect ratio controlled via `parameters.aspectRatio` (16:9 landscape, 9:16 portrait)
- Adapter pattern (models.js) isolates model-specific logic for easy extensibility

**Prompt Engineering:**
- System prompt (stored in `DEFAULT_SYSTEM_PROMPT` and localStorage) defines strict rules for coloring page generation
- Final prompt format: `${systemPrompt} <image_description>${userPrompt}</image_description>`
- Critical requirements enforced: thick black outlines, no shading/gradients, white fill areas, closed shapes

**URL Hash Key Sharing:**
- API keys can be shared via URL hash (`#key=...`) for family sharing
- Hash is checked on page load via `checkUrlHash()` in app.js:324
- Key is immediately saved to localStorage and hash cleared from URL for privacy

**Print Functionality:**
- Opens new window with properly sized print layout
- CSS `@page` rules set correct paper size and orientation
- Page dimensions defined in `pageStyles` object (app.js:247)

### UI/UX Architecture

**Modal System:**
- Settings modal controlled via `.show` class toggle
- Modal backdrop closes on click-outside
- Settings include API key, page size, orientation, and system prompt customization

**Loading States:**
- Emoji cycle animation during image generation (6 rotating emojis)
- Loading/error/success states managed via `.hidden` class
- UI sections: input → loading → image display

**Visual Effects:**
- Animated star field background generated dynamically (app.js:309)
- Mouse sparkle trail on desktop (app.js:354, throttled to 50ms)
- CSS keyframe animations for bouncing, fading, sliding

### Model Adapter Pattern

**Architecture** (models.js):
- `MODEL_REGISTRY` - Configuration object containing all model details (id, name, price, tier, endpoint)
- `ModelAdapter` - Base class defining adapter interface with `getEndpointUrl()` and `generate()` methods
- `ImagenAdapter` - Concrete adapter implementing Imagen API's `:predict` endpoint format
- `createModelAdapter()` - Factory function that instantiates appropriate adapter based on model key

**Usage** (app.js):
- `generateColoringPage()` creates adapter via `createModelAdapter(modelKey, apiKey)`
- Calls `adapter.generate(prompt, options)` which returns `{ imageBase64, mimeType }`
- Adapter handles all API-specific request/response formatting

**Extensibility:**
- To add new models: Add entry to `MODEL_REGISTRY` in models.js
- For different API endpoints: Create new adapter class (e.g., `GeminiAdapter`)
- Update `createModelAdapter()` to switch based on `config.endpoint`
- No changes needed to app.js

## Development Commands

This is a static site with no build process. To develop:

```bash
# Start development server (default port 8000)
./bin/start

# Or specify a custom port
./bin/start 3000

# Alternative: Use Python directly
python3 -m http.server 8000

# Alternative: Use npx serve
npx serve .
```

Then open http://localhost:8000

## Testing

No automated tests. Manual testing checklist:
1. Settings modal opens/closes correctly
2. API key saved to localStorage persists across sessions
3. Model selection persists across sessions
4. Image generation with each model tier (Fast/Standard/Ultra)
5. Verify correct API endpoint called in network tab for each model
6. Print preview shows correct page size and orientation
7. URL hash key sharing works and clears hash after load
8. Responsive design on mobile (animations disabled on small screens)
9. Error handling for invalid API keys or failed requests

## Important Implementation Notes

**API Key Security:**
- Keys stored in localStorage only (client-side)
- Never transmitted except directly to Google's API
- URL hash sharing includes security warning (app.js:108)

**Responsive Behavior:**
- Sparkle effects disabled on mobile (window.innerWidth check at app.js:354)
- Bounce animation disabled on mobile to prevent clipping (app.css:501)
- Header margin adjusted on mobile to account for fixed settings button

**Print Layout:**
- Print window styling must match selected page size exactly
- Image scales to fit within page bounds via `max-width/max-height: 100%`
- Margins set to 0 in `@page` rules

**DOM Manipulation:**
- Direct DOM queries and class toggles (no framework)
- All element references cached at top of app.js (lines 1-19)
- Event listeners attached directly to elements
- Models loaded via window exports from models.js (loaded before app.js)
