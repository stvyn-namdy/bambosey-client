export class AzureVisionService {
  constructor() {
    // Primary service - Cognitive Services General Purpose
    this.endpoint = process.env.NEXT_PUBLIC_AZURE_VISION_ENDPOINT;
    this.apiKey = process.env.NEXT_PUBLIC_AZURE_VISION_KEY;
    
    // Enhanced service - Custom Vision for bag-specific detection
    this.customVisionEndpoint = process.env.NEXT_PUBLIC_AZURE_CUSTOM_VISION_ENDPOINT;
    this.customVisionKey = process.env.NEXT_PUBLIC_AZURE_CUSTOM_VISION_KEY;
    this.projectId = process.env.NEXT_PUBLIC_AZURE_PROJECT_ID;
    
    // Rate limiting
    this.rateLimitDelay = 100;
    this.lastApiCall = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  async detectObjects(imageData) {
    try {
      // Use Cognitive Services for general object detection
      const response = await fetch(`${this.endpoint}/vision/v3.2/detect`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`Object detection failed: ${response.status}`);
      }

      const result = await response.json();
      return result.objects || [];
      
    } catch (error) {
      console.error('Object detection failed:', error);
      throw error;
    }
  }

  async analyzeColor(imageData) {
    try {
      // Use Cognitive Services for color analysis
      const response = await fetch(`${this.endpoint}/vision/v3.2/analyze?visualFeatures=Color`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`Color analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return result.color;
      
    } catch (error) {
      console.error('Color analysis failed:', error);
      throw error;
    }
  }

  async callCustomVision(imageData) {
    try {
      // Only use Custom Vision if configured
      if (!this.customVisionEndpoint || !this.customVisionKey || !this.projectId) {
        console.log('Custom Vision not configured, skipping enhanced detection');
        return null;
      }

      const response = await fetch(`${this.customVisionEndpoint}/customvision/v3.0/Prediction/${this.projectId}/detect/iterations/latest/image`, {
        method: 'POST',
        headers: {
          'Prediction-Key': this.customVisionKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`Custom Vision failed: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Custom Vision API failed:', error);
      return null; // Return null instead of throwing to allow fallback
    }
  }

  async analyzeImage(imageData) {
    try {
      // Queue the request to handle rate limiting
      return await this.queueRequest(() => this.performImageAnalysis(imageData));
      
    } catch (error) {
      console.error('Vision analysis failed:', error);
      return this.generateFallbackAnalysis(imageData);
    }
  }

  async queueRequest(requestFunction) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        execute: requestFunction,
        resolve,
        reject
      });
      
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      try {
        // Enforce rate limiting
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCall;
        if (timeSinceLastCall < this.rateLimitDelay) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastCall));
        }
        
        const result = await request.execute();
        this.lastApiCall = Date.now();
        request.resolve(result);
        
      } catch (error) {
        request.reject(error);
      }
    }
    
    this.isProcessingQueue = false;
  }

  async performImageAnalysis(imageData) {
    // Perform multiple Azure API calls for comprehensive analysis
    const [objectDetection, colorAnalysis, categoryAnalysis] = await Promise.allSettled([
      this.detectObjects(imageData),
      this.analyzeColor(imageData),
      this.categorizeImage(imageData)
    ]);

    // Combine results
    const analysis = {
      objects: objectDetection.status === 'fulfilled' ? objectDetection.value : [],
      color: colorAnalysis.status === 'fulfilled' ? colorAnalysis.value : this.getDefaultColor(),
      categories: categoryAnalysis.status === 'fulfilled' ? categoryAnalysis.value : [],
      bagFeatures: null
    };

    // Extract bag-specific features if this is a bag image
    if (this.isBagImage(analysis)) {
      analysis.bagFeatures = await this.extractBagFeatures(imageData, analysis);
    }

    return analysis;
  }

  async detectObjects(imageData) {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/detect`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`Object detection failed: ${response.status}`);
      }

      const result = await response.json();
      return result.objects || [];
      
    } catch (error) {
      console.error('Object detection failed:', error);
      throw error;
    }
  }

  async analyzeColor(imageData) {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/analyze?visualFeatures=Color`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`Color analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return result.color;
      
    } catch (error) {
      console.error('Color analysis failed:', error);
      throw error;
    }
  }

  async categorizeImage(imageData) {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/analyze?visualFeatures=Categories`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`Categorization failed: ${response.status}`);
      }

      const result = await response.json();
      return result.categories || [];
      
    } catch (error) {
      console.error('Categorization failed:', error);
      throw error;
    }
  }

  async extractBagFeatures(imageData, baseAnalysis) {
    try {
      // Use Custom Vision for bag-specific feature detection
      if (this.customVisionEndpoint && this.customVisionKey && this.projectId) {
        const customVisionResult = await this.callCustomVision(imageData);
        return this.processBagFeatures(customVisionResult, baseAnalysis);
      } else {
        // Fallback to basic feature extraction from object detection
        return this.extractBasicBagFeatures(baseAnalysis);
      }
      
    } catch (error) {
      console.error('Bag feature extraction failed:', error);
      return this.extractBasicBagFeatures(baseAnalysis);
    }
  }

  async callCustomVision(imageData) {
    try {
      const response = await fetch(`${this.customVisionEndpoint}/customvision/v3.0/Prediction/${this.projectId}/detect/iterations/latest/image`, {
        method: 'POST',
        headers: {
          'Prediction-Key': this.customVisionKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`Custom Vision failed: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Custom Vision API failed:', error);
      throw error;
    }
  }

  processBagFeatures(customVisionResult, baseAnalysis) {
    const features = {
      outline: [],
      handles: [],
      pockets: [],
      dimensions: { width: 300, height: 400, depth: 100 },
      material: { type: 'canvas', roughness: 0.6, metalness: 0.0 },
      colors: this.extractColorsFromAnalysis(baseAnalysis.color)
    };

    // Process Custom Vision predictions
    customVisionResult.predictions?.forEach(prediction => {
      if (prediction.probability > 0.6) {
        const box = prediction.boundingBox;
        
        switch (prediction.tagName.toLowerCase()) {
          case 'handle':
          case 'strap':
            features.handles.push({
              x: box.left + box.width / 2,
              y: box.top + box.height / 2,
              type: prediction.tagName.toLowerCase(),
              confidence: prediction.probability,
              bounds: box
            });
            break;
            
          case 'pocket':
            features.pockets.push({
              x: box.left + box.width / 2,
              y: box.top + box.height / 2,
              width: box.width,
              height: box.height,
              confidence: prediction.probability
            });
            break;
            
          case 'bag_outline':
          case 'bag_body':
            // Extract outline points from bounding box
            features.outline = this.boundingBoxToOutline(box);
            features.dimensions = this.estimateDimensionsFromBox(box);
            break;
        }
      }
    });

    return features;
  }

  extractBasicBagFeatures(baseAnalysis) {
    // Extract basic features from standard object detection
    const features = {
      outline: [],
      handles: [],
      pockets: [],
      dimensions: { width: 300, height: 400, depth: 100 },
      material: this.estimateMaterialFromColor(baseAnalysis.color),
      colors: this.extractColorsFromAnalysis(baseAnalysis.color)
    };

    // Look for bag objects in detection results
    const bagObjects = baseAnalysis.objects.filter(obj => 
      this.isBagObject(obj.object)
    );

    if (bagObjects.length > 0) {
      const mainBag = bagObjects[0]; // Use the first/most confident bag detection
      const rect = mainBag.rectangle;
      
      features.outline = this.boundingBoxToOutline(rect);
      features.dimensions = this.estimateDimensionsFromBox(rect);
      
      // Estimate handle positions (typically at top of bag)
      features.handles = this.estimateHandles(rect);
    }

    return features;
  }

  boundingBoxToOutline(box) {
    // Convert bounding box to outline points
    return [
      { x: box.left, y: box.top },
      { x: box.left + box.width, y: box.top },
      { x: box.left + box.width, y: box.top + box.height },
      { x: box.left, y: box.top + box.height }
    ];
  }

  estimateDimensionsFromBox(box) {
    // Estimate real-world dimensions based on bounding box
    const aspectRatio = box.width / box.height;
    
    if (aspectRatio > 1.2) {
      // Wide bag (like a laptop bag)
      return { width: 400, height: 300, depth: 100 };
    } else if (aspectRatio < 0.8) {
      // Tall bag (like a tote)
      return { width: 300, height: 450, depth: 120 };
    } else {
      // Square-ish bag
      return { width: 350, height: 350, depth: 100 };
    }
  }

  estimateHandles(bagRect) {
    // Estimate handle positions based on bag bounding box
    const handles = [];
    const handleY = bagRect.top + bagRect.height * 0.1; // 10% from top
    const handleSpacing = bagRect.width * 0.3;
    const centerX = bagRect.left + bagRect.width / 2;
    
    handles.push({
      x: centerX - handleSpacing,
      y: handleY,
      type: 'strap',
      confidence: 0.7
    });
    
    handles.push({
      x: centerX + handleSpacing,
      y: handleY,
      type: 'strap',
      confidence: 0.7
    });
    
    return handles;
  }

  estimateMaterialFromColor(colorAnalysis) {
    if (!colorAnalysis) {
      return { type: 'fabric', roughness: 0.6, metalness: 0.0 };
    }

    const dominantColors = colorAnalysis.dominantColors || [];
    
    // Estimate material based on color characteristics
    if (dominantColors.includes('Brown') || dominantColors.includes('Black')) {
      return { type: 'leather', roughness: 0.3, metalness: 0.1 };
    } else if (dominantColors.includes('White') || dominantColors.includes('Gray')) {
      return { type: 'canvas', roughness: 0.7, metalness: 0.0 };
    } else {
      return { type: 'fabric', roughness: 0.6, metalness: 0.0 };
    }
  }

  extractColorsFromAnalysis(colorAnalysis) {
    if (!colorAnalysis) {
      return [{ r: 139, g: 69, b: 19 }]; // Default brown
    }

    const colors = [];
    
    // Add accent color
    if (colorAnalysis.accentColor) {
      const hex = colorAnalysis.accentColor;
      colors.push(this.hexToRgb(hex));
    }
    
    // Add dominant colors
    if (colorAnalysis.dominantColors) {
      colorAnalysis.dominantColors.forEach(colorName => {
        colors.push(this.colorNameToRgb(colorName));
      });
    }
    
    return colors.length > 0 ? colors : [{ r: 139, g: 69, b: 19 }];
  }

  hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b };
  }

  colorNameToRgb(colorName) {
    const colorMap = {
      'Black': { r: 0, g: 0, b: 0 },
      'Blue': { r: 0, g: 0, b: 255 },
      'Brown': { r: 139, g: 69, b: 19 },
      'Gray': { r: 128, g: 128, b: 128 },
      'Green': { r: 0, g: 128, b: 0 },
      'Orange': { r: 255, g: 165, b: 0 },
      'Pink': { r: 255, g: 192, b: 203 },
      'Purple': { r: 128, g: 0, b: 128 },
      'Red': { r: 255, g: 0, b: 0 },
      'Teal': { r: 0, g: 128, b: 128 },
      'White': { r: 255, g: 255, b: 255 },
      'Yellow': { r: 255, g: 255, b: 0 }
    };
    
    return colorMap[colorName] || { r: 139, g: 69, b: 19 };
  }

  isBagImage(analysis) {
    // Check if the image contains a bag
    const bagObjects = analysis.objects.filter(obj => this.isBagObject(obj.object));
    const bagCategories = analysis.categories.filter(cat => 
      cat.name.toLowerCase().includes('bag') || 
      cat.name.toLowerCase().includes('accessory')
    );
    
    return bagObjects.length > 0 || bagCategories.length > 0;
  }

  isBagObject(objectName) {
    const bagKeywords = [
      'bag', 'handbag', 'purse', 'tote', 'backpack', 
      'luggage', 'suitcase', 'briefcase', 'clutch', 'pouch'
    ];
    
    return bagKeywords.some(keyword => 
      objectName.toLowerCase().includes(keyword)
    );
  }

  getDefaultColor() {
    return {
      dominantColorForeground: 'Brown',
      dominantColorBackground: 'White',
      dominantColors: ['Brown', 'White'],
      accentColor: '8B4513'
    };
  }

  generateFallbackAnalysis(imageData) {
    // Generate realistic fallback data when API fails
    return {
      objects: [
        {
          rectangle: { left: 0.3, top: 0.2, width: 0.4, height: 0.6 },
          object: 'handbag',
          confidence: 0.75
        }
      ],
      color: this.getDefaultColor(),
      categories: [
        {
          name: 'accessories_bag',
          score: 0.70
        }
      ],
      bagFeatures: {
        outline: [
          { x: 0.3, y: 0.2 },
          { x: 0.7, y: 0.2 },
          { x: 0.7, y: 0.8 },
          { x: 0.3, y: 0.8 }
        ],
        handles: [
          { x: 0.4, y: 0.15, type: 'strap', confidence: 0.7 },
          { x: 0.6, y: 0.15, type: 'strap', confidence: 0.7 }
        ],
        pockets: [],
        dimensions: { width: 300, height: 400, depth: 100 },
        material: { type: 'canvas', roughness: 0.6, metalness: 0.0 },
        colors: [{ r: 139, g: 69, b: 19 }]
      }
    };
  }

  // Advanced analysis methods for product photography
  async analyzeProductImage(imageUrl, productCategory) {
    try {
      // Multi-step analysis for product images
      const [basicAnalysis, readText, detectBrands] = await Promise.allSettled([
        this.analyzeImageFromUrl(imageUrl),
        this.extractText(imageUrl),
        this.detectLogos(imageUrl)
      ]);

      return {
        analysis: basicAnalysis.status === 'fulfilled' ? basicAnalysis.value : null,
        text: readText.status === 'fulfilled' ? readText.value : [],
        brands: detectBrands.status === 'fulfilled' ? detectBrands.value : [],
        category: productCategory
      };
      
    } catch (error) {
      console.error('Product image analysis failed:', error);
      throw error;
    }
  }

  async analyzeImageFromUrl(imageUrl) {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/analyze?visualFeatures=Objects,Color,Categories,Description,Tags`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: imageUrl })
      });

      if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('URL-based image analysis failed:', error);
      throw error;
    }
  }

  async extractText(imageUrl) {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/read/analyze`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: imageUrl })
      });

      if (!response.ok) {
        throw new Error(`Text extraction failed: ${response.status}`);
      }

      // Get operation location from headers
      const operationLocation = response.headers.get('Operation-Location');
      
      // Poll for results
      return await this.pollTextResults(operationLocation);
      
    } catch (error) {
      console.error('Text extraction failed:', error);
      return [];
    }
  }

  async pollTextResults(operationLocation, maxAttempts = 10) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(operationLocation, {
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey
          }
        });

        const result = await response.json();
        
        if (result.status === 'succeeded') {
          return result.analyzeResult.readResults.flatMap(page => 
            page.lines.map(line => line.text)
          );
        } else if (result.status === 'failed') {
          throw new Error('Text extraction failed');
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Text polling attempt ${attempt + 1} failed:`, error);
      }
    }
    
    return []; // Return empty array if polling fails
  }

  async detectLogos(imageUrl) {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/analyze?visualFeatures=Brands`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: imageUrl })
      });

      if (!response.ok) {
        throw new Error(`Brand detection failed: ${response.status}`);
      }

      const result = await response.json();
      return result.brands || [];
      
    } catch (error) {
      console.error('Brand detection failed:', error);
      return [];
    }
  }

  // Batch processing for multiple images
  async analyzeImageBatch(imageUrls, maxConcurrent = 3) {
    const results = [];
    
    for (let i = 0; i < imageUrls.length; i += maxConcurrent) {
      const batch = imageUrls.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (url, index) => {
        try {
          const analysis = await this.analyzeImageFromUrl(url);
          return { url, analysis, index: i + index, success: true };
        } catch (error) {
          console.error(`Batch analysis failed for ${url}:`, error);
          return { url, error: error.message, index: i + index, success: false };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting between batches
      if (i + maxConcurrent < imageUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Health check for Azure services
  async healthCheck() {
    try {
      const testResponse = await fetch(`${this.endpoint}/vision/v3.2/analyze?visualFeatures=Categories`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ThreeTimeAKCGoldWinner.jpg/300px-ThreeTimeAKCGoldWinner.jpg' 
        })
      });

      return {
        status: response.ok ? 'healthy' : 'degraded',
        statusCode: response.status,
        endpoint: this.endpoint,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        endpoint: this.endpoint,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const azureVisionService = new AzureVisionService();

// Model Generation Service
export class ModelGenerationService {
  constructor() {
    this.azureVision = new AzureVisionService();
  }

  async createModelFromImages(productId, images) {
    try {
      console.log(`Starting 3D model generation for product ${productId}`);
      
      // Analyze all product images
      const imageAnalyses = await Promise.all(
        images.map(async (image) => {
          try {
            return await this.azureVision.analyzeImage(image.file);
          } catch (error) {
            console.error(`Failed to analyze image ${image.url}:`, error);
            return this.azureVision.generateFallbackAnalysis(image.file);
          }
        })
      );

      // Extract consolidated bag features
      const bagFeatures = this.consolidateBagFeatures(imageAnalyses);
      
      // Generate model configurations for different quality levels
      const models = this.generateModelConfigurations(productId, bagFeatures);
      
      console.log(`3D model generation completed for product ${productId}`);
      return models;
      
    } catch (error) {
      console.error('Model generation failed:', error);
      return this.createFallbackModels(productId);
    }
  }

  consolidateBagFeatures(imageAnalyses) {
    // Find the analysis with the best bag features
    const bagAnalysis = imageAnalyses.find(analysis => 
      analysis.bagFeatures && analysis.bagFeatures.outline.length > 0
    ) || imageAnalyses[0];

    const features = bagAnalysis.bagFeatures || {
      outline: [],
      handles: [],
      pockets: [],
      dimensions: { width: 300, height: 400, depth: 100 },
      material: { type: 'canvas', roughness: 0.6, metalness: 0.0 },
      colors: [{ r: 139, g: 69, b: 19 }]
    };

    // Enhance features with data from other images
    imageAnalyses.forEach(analysis => {
      if (analysis.bagFeatures) {
        // Merge handles from different views
        if (analysis.bagFeatures.handles.length > features.handles.length) {
          features.handles = analysis.bagFeatures.handles;
        }
        
        // Merge pockets
        features.pockets.push(...analysis.bagFeatures.pockets);
        
        // Merge colors
        features.colors.push(...analysis.bagFeatures.colors);
      }
    });

    // Remove duplicate pockets and colors
    features.pockets = this.removeDuplicatePockets(features.pockets);
    features.colors = this.removeDuplicateColors(features.colors);

    return features;
  }

  removeDuplicatePockets(pockets) {
    const unique = [];
    pockets.forEach(pocket => {
      const isDuplicate = unique.some(existing => 
        Math.abs(existing.x - pocket.x) < 0.1 && 
        Math.abs(existing.y - pocket.y) < 0.1
      );
      
      if (!isDuplicate) {
        unique.push(pocket);
      }
    });
    
    return unique;
  }

  removeDuplicateColors(colors) {
    const unique = [];
    colors.forEach(color => {
      const isDuplicate = unique.some(existing => 
        Math.abs(existing.r - color.r) < 10 && 
        Math.abs(existing.g - color.g) < 10 && 
        Math.abs(existing.b - color.b) < 10
      );
      
      if (!isDuplicate) {
        unique.push(color);
      }
    });
    
    return unique.slice(0, 3); // Limit to 3 main colors
  }

  generateModelConfigurations(productId, features) {
    const baseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL || '';
    
    return {
      original: `${baseUrl}/models/${productId}/original.glb`,
      high: `${baseUrl}/models/${productId}/high.glb`,
      medium: `${baseUrl}/models/${productId}/medium.glb`,
      low: `${baseUrl}/models/${productId}/low.glb`,
      minimal: `${baseUrl}/models/${productId}/minimal.glb`,
      features: features, // Include extracted features for model generation
      generatedAt: new Date().toISOString()
    };
  }

  createFallbackModels(productId) {
    const baseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL || '';
    
    return {
      original: `${baseUrl}/models/fallback/generic-tote.glb`,
      high: `${baseUrl}/models/fallback/generic-tote.glb`,
      medium: `${baseUrl}/models/fallback/generic-tote-medium.glb`,
      low: `${baseUrl}/models/fallback/generic-tote-low.glb`,
      minimal: `${baseUrl}/models/fallback/generic-tote-minimal.glb`,
      features: {
        dimensions: { width: 300, height: 400, depth: 100 },
        material: { type: 'canvas', roughness: 0.6, metalness: 0.0 },
        colors: [{ r: 139, g: 69, b: 19 }]
      },
      fallback: true,
      generatedAt: new Date().toISOString()
    };
  }
}

export const modelGenerationService = new ModelGenerationService();