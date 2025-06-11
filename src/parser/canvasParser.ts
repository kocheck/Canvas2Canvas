import {
  CanvasData,
  CanvasNode,
  CanvasEdge,
} from './typeDefinitions';

export class CanvasParserError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'CanvasParserError';
  }
}

export class CanvasParser {
  /**
   * Parse a Canvas file content into structured data
   */
  static parseCanvasFile(fileContent: string): CanvasData {
    try {
      const jsonData = JSON.parse(fileContent);
      return this.validateAndParseCanvasData(jsonData);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new CanvasParserError(
          'Invalid JSON format in canvas file'
        );
      }
      throw error;
    }
  }

  /**
   * Validate and parse the JSON data to ensure it matches Canvas format
   */
  private static validateAndParseCanvasData(
    jsonData: any
  ): CanvasData {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new CanvasParserError(
        'Canvas file must contain a valid JSON object'
      );
    }

    const nodes = this.validateNodes(jsonData.nodes || []);
    const edges = this.validateEdges(jsonData.edges || []);

    return { nodes, edges };
  }

  /**
   * Validate and parse canvas nodes
   */
  private static validateNodes(nodesData: any[]): CanvasNode[] {
    if (!Array.isArray(nodesData)) {
      throw new CanvasParserError('Canvas nodes must be an array');
    }

    return nodesData.map((nodeData, index) => {
      try {
        return this.validateNode(nodeData);
      } catch (error) {
        throw new CanvasParserError(
          `Invalid node at index ${index}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    });
  }

  /**
   * Validate a single canvas node
   */
  private static validateNode(nodeData: any): CanvasNode {
    if (!nodeData || typeof nodeData !== 'object') {
      throw new Error('Node must be an object');
    }

    const { id, type, x, y, width, height } = nodeData;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      throw new Error('Node must have a valid string id');
    }

    if (!type || !['text', 'file', 'link', 'group'].includes(type)) {
      throw new Error(
        'Node must have a valid type (text, file, link, or group)'
      );
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new Error(
        'Node must have valid numeric x and y coordinates'
      );
    }

    if (
      typeof width !== 'number' ||
      typeof height !== 'number' ||
      width <= 0 ||
      height <= 0
    ) {
      throw new Error(
        'Node must have valid positive width and height'
      );
    }

    const node: CanvasNode = {
      id,
      type,
      x,
      y,
      width,
      height,
    };

    // Add optional properties
    if (nodeData.color) node.color = nodeData.color;
    if (nodeData.text) node.text = nodeData.text;
    if (nodeData.file) node.file = nodeData.file;
    if (nodeData.subpath) node.subpath = nodeData.subpath;
    if (nodeData.url) node.url = nodeData.url;
    if (nodeData.label) node.label = nodeData.label;
    if (nodeData.background) node.background = nodeData.background;
    if (nodeData.backgroundStyle)
      node.backgroundStyle = nodeData.backgroundStyle;

    // Type-specific validation
    this.validateNodeTypeSpecific(node);

    return node;
  }

  /**
   * Validate type-specific node properties
   */
  private static validateNodeTypeSpecific(node: CanvasNode): void {
    switch (node.type) {
      case 'text':
        if (!node.text) {
          throw new Error('Text node must have text content');
        }
        break;
      case 'file':
        if (!node.file) {
          throw new Error('File node must have a file path');
        }
        break;
      case 'link':
        if (!node.url) {
          throw new Error('Link node must have a URL');
        }
        break;
      case 'group':
        // Groups can optionally have labels, no strict requirements
        break;
    }
  }

  /**
   * Validate and parse canvas edges
   */
  private static validateEdges(edgesData: any[]): CanvasEdge[] {
    if (!Array.isArray(edgesData)) {
      throw new CanvasParserError('Canvas edges must be an array');
    }

    return edgesData.map((edgeData, index) => {
      try {
        return this.validateEdge(edgeData);
      } catch (error) {
        throw new CanvasParserError(
          `Invalid edge at index ${index}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    });
  }

  /**
   * Validate a single canvas edge
   */
  private static validateEdge(edgeData: any): CanvasEdge {
    if (!edgeData || typeof edgeData !== 'object') {
      throw new Error('Edge must be an object');
    }

    const { id, fromNode, toNode } = edgeData;

    if (!id || typeof id !== 'string') {
      throw new Error('Edge must have a valid string id');
    }

    if (!fromNode || typeof fromNode !== 'string') {
      throw new Error('Edge must have a valid fromNode id');
    }

    if (!toNode || typeof toNode !== 'string') {
      throw new Error('Edge must have a valid toNode id');
    }

    const edge: CanvasEdge = {
      id,
      fromNode,
      toNode,
    };

    // Add optional properties
    if (
      edgeData.fromSide &&
      ['top', 'right', 'bottom', 'left'].includes(edgeData.fromSide)
    ) {
      edge.fromSide = edgeData.fromSide;
    }
    if (
      edgeData.toSide &&
      ['top', 'right', 'bottom', 'left'].includes(edgeData.toSide)
    ) {
      edge.toSide = edgeData.toSide;
    }
    if (
      edgeData.fromEnd &&
      ['none', 'arrow'].includes(edgeData.fromEnd)
    ) {
      edge.fromEnd = edgeData.fromEnd;
    }
    if (
      edgeData.toEnd &&
      ['none', 'arrow'].includes(edgeData.toEnd)
    ) {
      edge.toEnd = edgeData.toEnd;
    }
    if (edgeData.color) edge.color = edgeData.color;
    if (edgeData.label) edge.label = edgeData.label;

    return edge;
  }

  /**
   * Get canvas bounds for scaling purposes
   */
  static getCanvasBounds(canvasData: CanvasData): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  } {
    if (canvasData.nodes.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        width: 0,
        height: 0,
      };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of canvasData.nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
