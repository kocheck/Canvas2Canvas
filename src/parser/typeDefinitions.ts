// JSON Canvas format type definitions
// Based on the Canvas format specification

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export interface CanvasNode {
  id: string;
  type: 'text' | 'file' | 'link' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;

  // Text node specific properties
  text?: string;

  // File node specific properties
  file?: string; // path to file
  subpath?: string; // for linking to specific parts of files

  // Link node specific properties
  url?: string;

  // Group specific properties
  label?: string;
  background?: string;
  backgroundStyle?: string;
}

export interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toSide?: 'top' | 'right' | 'bottom' | 'left';
  fromEnd?: 'none' | 'arrow';
  toEnd?: 'none' | 'arrow';
  color?: string;
  label?: string;
}

// Import progress tracking
export interface ImportProgress {
  stage: 'parsing' | 'converting' | 'creating' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
}

// FigJam node mapping types
export interface FigJamNodeMap {
  [canvasNodeId: string]: BaseNode;
}

// Conversion result
export interface ConversionResult {
  success: boolean;
  nodesCreated: number;
  edgesCreated: number;
  errors: string[];
  warnings: string[];
}
