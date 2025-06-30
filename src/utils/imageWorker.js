import { ImageAnalyzer } from './imageAnalysis';

self.onmessage = async function(e) {
  const { id, imageData, options } = e.data;
  const analyzer = new ImageAnalyzer();
  const result = await analyzer.analyzeImage(imageData, options);
  self.postMessage({ id, result });
}; 