// Model configurations
const MODEL_REGISTRY = {
  'imagen-fast': {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4 Fast',
    tier: 'budget',
    price: 0.02,
    priceDisplay: '$0.02',
    endpoint: 'predict',
    description: 'Fast generation, good for testing'
  },
  'imagen-standard': {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4 Standard',
    tier: 'standard',
    price: 0.04,
    priceDisplay: '$0.04',
    endpoint: 'predict',
    description: 'Balanced quality and speed'
  },
  'imagen-ultra': {
    id: 'imagen-4.0-ultra-generate-001',
    name: 'Imagen 4 Ultra',
    tier: 'premium',
    price: 0.06,
    priceDisplay: '$0.06',
    endpoint: 'predict',
    description: 'Highest quality coloring pages'
  }
};

const DEFAULT_MODEL = 'imagen-standard';

// Base adapter class
class ModelAdapter {
  constructor(modelKey, apiKey) {
    this.config = MODEL_REGISTRY[modelKey];
    this.apiKey = apiKey;
  }

  getEndpointUrl() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.config.id}:${this.config.endpoint}`;
  }
}

// Imagen adapter for :predict endpoint
class ImagenAdapter extends ModelAdapter {
  async generate(prompt, options = {}) {
    const { aspectRatio = '16:9' } = options;

    const response = await fetch(this.getEndpointUrl(), {
      method: 'POST',
      headers: {
        'x-goog-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{ prompt }],
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

    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No image generated');
    }

    return {
      imageBase64: data.predictions[0].bytesBase64Encoded,
      mimeType: data.predictions[0].mimeType || 'image/png'
    };
  }
}

// Factory function to create appropriate adapter
function createModelAdapter(modelKey, apiKey) {
  const config = MODEL_REGISTRY[modelKey];
  if (!config) {
    throw new Error(`Unknown model: ${modelKey}`);
  }

  // For now, all models use ImagenAdapter
  // Future: switch based on config.endpoint
  return new ImagenAdapter(modelKey, apiKey);
}

// Export to window
window.ModelRegistry = MODEL_REGISTRY;
window.createModelAdapter = createModelAdapter;
window.DEFAULT_MODEL = DEFAULT_MODEL;
