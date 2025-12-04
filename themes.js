// themes.js - Page Themes: composable content types and style tags

// Built-in content themes (what to draw)
const BUILTIN_CONTENT_THEMES = [
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Perfect for cars, trucks, planes, and trains with friendly faces',
    isBuiltIn: true,
    prompt: `Create a cute, child-friendly coloring book illustration of a vehicle.

Rules:
- Line art style.
- Thick, smooth black outlines only.
- No border around the image.
- No shading, gradients, or cross-hatching — pure white fill areas for coloring.
- Uniform line weight (slightly bold, consistent throughout).
- Clean, closed shapes with no sketchiness.

Vehicle-Specific Rules:
- Add ONE friendly face on the front of vehicles
- Exactly two eyes and one smiling mouth
- No other parts should resemble faces
- Windows, wheels, and details stay simple and neutral
- Keep the vehicle recognizable and fun

Scene Rules:
- Simple road, sky, or garage scene
- Minimal details, child-friendly
- No realistic or complex elements`
  },
  {
    id: 'animals',
    name: 'Animals',
    description: 'Cute creatures with proper anatomy and natural habitats',
    isBuiltIn: true,
    prompt: `Create a cute, child-friendly animal coloring book illustration.

Rules:
- Line art style.
- Thick, smooth black outlines only.
- No border around the image.
- No shading, gradients, or cross-hatching — pure white fill areas for coloring.
- Uniform line weight (slightly bold, consistent throughout).
- Clean, closed shapes with no sketchiness.

Animal-Specific Rules:
- Friendly, cartoonish style (not realistic)
- Expressive eyes and simple smile
- Proper basic anatomy (4 legs for mammals, 2 for birds, etc.)
- Add simple texture hints (fur lines, scales, feathers)
- Keep features cute and approachable

Scene Rules:
- Natural habitat appropriate to the animal
- Simple plants, grass, trees, or water
- Child-friendly and inviting`
  },
  {
    id: 'nature',
    name: 'Nature & Scenes',
    description: 'Beautiful nature scenes with flowers, trees, and landscapes',
    isBuiltIn: true,
    prompt: `Create a nature scene coloring book illustration.

Rules:
- Line art style.
- Thick, smooth black outlines only.
- No border around the image.
- No shading, gradients, or cross-hatching — pure white fill areas for coloring.
- Uniform line weight (slightly bold, consistent throughout).
- Clean, closed shapes with no sketchiness.

Nature Scene Rules:
- Include multiple natural elements (flowers, trees, clouds, sun)
- Create depth with foreground and background elements
- Add simple patterns to flowers, leaves, grass
- Keep everything child-friendly and whimsical
- Can include cute animals or insects

Composition:
- Balanced layout with good variety
- Mix of large and small elements
- Clear focal point`
  },
  {
    id: 'people',
    name: 'People & Characters',
    description: 'Friendly people and characters in fun scenes',
    isBuiltIn: true,
    prompt: `Create a child-friendly coloring book illustration of people or characters.

Rules:
- Line art style.
- Thick, smooth black outlines only.
- No border around the image.
- No shading, gradients, or cross-hatching — pure white fill areas for coloring.
- Uniform line weight (slightly bold, consistent throughout).
- Clean, closed shapes with no sketchiness.

Character Rules:
- Simple, friendly features with expressive faces
- Appropriate proportions for children's art
- Clear, recognizable clothing and accessories
- Welcoming poses and expressions
- Diverse, inclusive representation

Scene Rules:
- Age-appropriate scenes (playground, home, school, etc.)
- Simple environmental details
- Child-friendly and inviting`
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Magic',
    description: 'Unicorns, dragons, and magical creatures',
    isBuiltIn: true,
    prompt: `Create a whimsical, magical coloring book illustration.

Rules:
- Line art style.
- Thick, smooth black outlines only.
- No border around the image.
- No shading, gradients, or cross-hatching — pure white fill areas for coloring.
- Uniform line weight (slightly bold, consistent throughout).
- Clean, closed shapes with no sketchiness.

Fantasy Rules:
- Cute, friendly magical creatures (unicorns, dragons, fairies, etc.)
- Sparkles, stars, clouds, and magical elements
- Expressive, kind faces on creatures
- No scary or intimidating features
- Maintain child-friendly, enchanting atmosphere

Scene Rules:
- Magical landscapes (rainbow, clouds, castle, enchanted forest)
- Fantasy elements like stars, moons, sparkles
- Keep everything whimsical and inviting`
  }
];

// Built-in style tags (how to draw it)
const BUILTIN_STYLE_TAGS = [
  {
    id: 'toddler-simple',
    name: 'Toddler Simple',
    emoji: '🧸',
    description: 'Ages 2-4: Very thick lines, 3-5 large shapes',
    promptModifier: `

STYLE MODIFICATION - TODDLER SIMPLE (Ages 2-4):
- VERY thick black outlines (extra bold, at least 3-4px equivalent)
- Only 3-5 large, simple shapes maximum
- No small details or intricate patterns whatsoever
- Make objects LARGE and easy to recognize
- Use basic shapes: circles, squares, triangles
- Pure white fill areas, no shading
- Closed shapes that are very easy to color inside
- Plain white background or just 1-2 simple ground elements
- No complex scenes or backgrounds`
  },
  {
    id: 'kid-friendly',
    name: 'Kid-Friendly',
    emoji: '🎨',
    description: 'Ages 5-7: Standard coloring book style',
    promptModifier: `

STYLE MODIFICATION - KID-FRIENDLY (Ages 5-7):
- Standard coloring book line art style
- Thick, smooth black outlines (2-3px equivalent)
- Moderate detail level - not too simple, not too complex
- Uniform line weight, consistent throughout
- Clean, closed shapes with no sketchiness
- Pure white fill areas, no shading or gradients
- No border around the image
- Balanced composition with clear focal points`
  },
  {
    id: 'detailed',
    name: 'Detailed',
    emoji: '✨',
    description: 'Ages 8+: Intricate patterns and fine details',
    promptModifier: `

STYLE MODIFICATION - DETAILED (Ages 8+):
- More intricate patterns and fine details
- Clean black outlines with varied line weights for interest
- Include patterns like scales, feathers, textures, decorative elements
- More realistic proportions and anatomy
- Complex backgrounds with multiple elements and layers
- Small details that require precision and patience
- Rich environment with depth (foreground, middle, background)
- Pure white fill areas, no shading or gradients`
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    emoji: '🎭',
    description: 'Extra bold lines for better visibility',
    promptModifier: `

STYLE MODIFICATION - HIGH CONTRAST:
- EXTRA BOLD black outlines (4-5px equivalent) for maximum visibility
- Strong contrast between lines and white spaces
- Slightly thicker lines throughout compared to standard
- Clear definition of all shapes and boundaries
- No thin or delicate lines - everything must be bold
- Excellent for printing and visual clarity`
  }
];

const DEFAULT_CONTENT_THEME_ID = 'animals';
const DEFAULT_STYLE_TAGS = ['kid-friendly']; // Start with kid-friendly as default

// Load custom content themes from localStorage
function loadCustomContentThemes() {
  const stored = localStorage.getItem('content_themes');
  return stored ? JSON.parse(stored) : [];
}

// Save custom content themes to localStorage
function saveCustomContentThemes(themes) {
  localStorage.setItem('content_themes', JSON.stringify(themes));
}

// Get all content themes (built-in + custom)
function getAllContentThemes() {
  return [...BUILTIN_CONTENT_THEMES, ...loadCustomContentThemes()];
}

// Get content theme by ID
function getContentThemeById(id) {
  return getAllContentThemes().find(t => t.id === id);
}

// Compose final prompt from content theme + active style tags
function composePrompt(contentThemeId, activeStyleTagIds) {
  const contentTheme = getContentThemeById(contentThemeId);
  if (!contentTheme) return '';

  let finalPrompt = contentTheme.prompt;

  // Append each active style tag's modifier
  activeStyleTagIds.forEach(tagId => {
    const styleTag = BUILTIN_STYLE_TAGS.find(t => t.id === tagId);
    if (styleTag) {
      finalPrompt += styleTag.promptModifier;
    }
  });

  return finalPrompt;
}

// Export to window
window.BUILTIN_CONTENT_THEMES = BUILTIN_CONTENT_THEMES;
window.BUILTIN_STYLE_TAGS = BUILTIN_STYLE_TAGS;
window.DEFAULT_CONTENT_THEME_ID = DEFAULT_CONTENT_THEME_ID;
window.DEFAULT_STYLE_TAGS = DEFAULT_STYLE_TAGS;
window.loadCustomContentThemes = loadCustomContentThemes;
window.saveCustomContentThemes = saveCustomContentThemes;
window.getAllContentThemes = getAllContentThemes;
window.getContentThemeById = getContentThemeById;
window.composePrompt = composePrompt;
