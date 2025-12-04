// Model configurations
const MODEL_REGISTRY = {
  'imagen-fast': {
    provider: 'google',
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4 Fast',
    tier: 'budget',
    price: 0.02,
    priceDisplay: '$0.02',
    endpoint: 'predict',
    description: 'Fast generation, good for testing'
  },
  'imagen-standard': {
    provider: 'google',
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4 Standard',
    tier: 'standard',
    price: 0.04,
    priceDisplay: '$0.04',
    endpoint: 'predict',
    description: 'Balanced quality and speed'
  },
  'imagen-ultra': {
    provider: 'google',
    id: 'imagen-4.0-ultra-generate-001',
    name: 'Imagen 4 Ultra',
    tier: 'premium',
    price: 0.06,
    priceDisplay: '$0.06',
    endpoint: 'predict',
    description: 'Highest quality coloring pages'
  },
  'dalle-2': {
    provider: 'openai',
    id: 'dall-e-2',
    name: 'DALL-E 2',
    tier: 'budget',
    price: 0.02,
    priceDisplay: '$0.02',
    endpoint: 'generations',
    description: 'Fast, affordable coloring pages'
  },
  'dalle-3-standard': {
    provider: 'openai',
    id: 'dall-e-3',
    name: 'DALL-E 3 Standard',
    tier: 'standard',
    price: 0.04,
    priceDisplay: '$0.04',
    endpoint: 'generations',
    quality: 'standard',
    description: 'High quality, balanced cost'
  },
  'dalle-3-hd': {
    provider: 'openai',
    id: 'dall-e-3',
    name: 'DALL-E 3 HD',
    tier: 'premium',
    price: 0.08,
    priceDisplay: '$0.08',
    endpoint: 'generations',
    quality: 'hd',
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

// OpenAI adapter for :generations endpoint
class OpenAIAdapter extends ModelAdapter {
  getEndpointUrl() {
    return 'https://api.openai.com/v1/images/generations';
  }

  async generate(prompt, options = {}) {
    const { orientation = 'landscape' } = options;

    // OpenAI uses fixed sizes, no aspect ratio
    // For landscape/portrait, use 1024x1024 (square) for simplicity
    // Could enhance later to use 1792x1024 / 1024x1792
    const size = '1024x1024';

    const requestBody = {
      model: this.config.id,
      prompt: prompt,
      n: 1,
      size: size,
      response_format: 'b64_json'
    };

    // Add quality parameter for DALL-E 3 HD
    if (this.config.quality) {
      requestBody.quality = this.config.quality;
    }

    const response = await fetch(this.getEndpointUrl(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No image generated');
    }

    return {
      imageBase64: data.data[0].b64_json,
      mimeType: 'image/png'
    };
  }
}

// Factory function to create appropriate adapter
function createModelAdapter(modelKey, apiKey) {
  const config = MODEL_REGISTRY[modelKey];
  if (!config) {
    throw new Error(`Unknown model: ${modelKey}`);
  }

  // Route to appropriate adapter based on provider
  switch (config.provider) {
    case 'google':
      return new ImagenAdapter(modelKey, apiKey);
    case 'openai':
      return new OpenAIAdapter(modelKey, apiKey);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Export to window
window.ModelRegistry = MODEL_REGISTRY;
window.createModelAdapter = createModelAdapter;
window.DEFAULT_MODEL = DEFAULT_MODEL;
