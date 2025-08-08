export interface MeasurementResult {
  id?: string;
  image?: string;
  length?: number;
  girth?: number;
  confidence?: number;
  timestamp: string;
  date?: string;
  unit?: 'cm' | 'in';
  referenceMeasurement?: number;
  analysisPoints?: any;
  measurementPoints?: {
    lengthStart: { x: number; y: number };
    lengthEnd: { x: number; y: number };
    girthCenter?: { x: number; y: number };
    girthRadius?: number;
  };
  objectOutline?: { x: number; y: number }[];
}

export interface PumpingSession {
  id: string;
  date: string;
  duration: number;
  pressure: number;
  sets: number;
  focus: 'length' | 'girth' | 'both';
  notes?: string;
}