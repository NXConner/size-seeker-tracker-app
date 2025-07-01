// Advanced image optimization utilities

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  progressive?: boolean;
  blur?: number;
  sharpen?: boolean;
}

export interface OptimizedImage {
  data: string;
  size: number;
  format: string;
  width: number;
  height: number;
  originalSize: number;
  compressionRatio: number;
}

// WebP support detection
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Intelligent image compression
export class ImageOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async optimize(
    imageData: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp',
      progressive = true,
      blur = 0,
      sharpen = false
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await this.processImage(img, {
            quality,
            maxWidth,
            maxHeight,
            format,
            progressive,
            blur,
            sharpen
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = imageData;
    });
  }

  private async processImage(
    img: HTMLImageElement,
    options: Required<ImageOptimizationOptions>
  ): Promise<OptimizedImage> {
    const { quality, maxWidth, maxHeight, format, progressive, blur, sharpen } = options;

    // Calculate new dimensions
    const { width, height } = this.calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight
    );

    // Set canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;

    // Apply blur if specified
    if (blur > 0) {
      this.ctx.filter = `blur(${blur}px)`;
    }

    // Draw image
    this.ctx.drawImage(img, 0, 0, width, height);

    // Apply sharpening if requested
    if (sharpen) {
      this.applySharpening();
    }

    // Convert to desired format
    let mimeType: string;
    switch (format) {
      case 'webp':
        mimeType = 'image/webp';
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      default:
        mimeType = 'image/webp';
    }

    // Generate optimized image
    const optimizedData = this.canvas.toDataURL(mimeType, quality);
    const originalSize = this.getBase64Size(imageData);
    const optimizedSize = this.getBase64Size(optimizedData);

    return {
      data: optimizedData,
      size: optimizedSize,
      format,
      width,
      height,
      originalSize,
      compressionRatio: optimizedSize / originalSize
    };
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private applySharpening(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Simple unsharp mask
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];

    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += tempData[idx] * kernel[ky + 1][kx + 1];
            }
          }
          const idx = (y * width + x) * 4 + c;
          data[idx] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private getBase64Size(base64: string): number {
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.ceil((base64.length * 3) / 4) - padding;
  }
}

// Progressive image loading
export class ProgressiveImageLoader {
  private static instance: ProgressiveImageLoader;
  private cache = new Map<string, string>();

  static getInstance(): ProgressiveImageLoader {
    if (!ProgressiveImageLoader.instance) {
      ProgressiveImageLoader.instance = new ProgressiveImageLoader();
    }
    return ProgressiveImageLoader.instance;
  }

  async loadProgressive(
    lowResUrl: string,
    highResUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const cacheKey = `${lowResUrl}-${highResUrl}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Load low resolution first
    const lowResImage = await this.loadImage(lowResUrl);
    onProgress?.(0.3);

    // Load high resolution
    const highResImage = await this.loadImage(highResUrl);
    onProgress?.(1.0);

    this.cache.set(cacheKey, highResImage);
    return highResImage;
  }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}

// Image preloading utility
export class ImagePreloader {
  private preloadedImages = new Set<string>();

  async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadSingle(url));
    await Promise.all(promises);
  }

  private async preloadSingle(url: string): Promise<void> {
    if (this.preloadedImages.has(url)) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(url);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  isPreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }
}

// Lazy loading with intersection observer
export const useLazyImage = (
  src: string,
  placeholder?: string,
  threshold: number = 0.1
) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    onLoad: handleLoad
  };
};

// Export React for hooks
import React from 'react'; 