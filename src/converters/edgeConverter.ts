/// <reference types="@figma/plugin-typings" />

import { CanvasEdge, FigJamNodeMap } from '../parser/typeDefinitions';

export class EdgeConverter {
  private static readonly DEFAULT_STROKE_WEIGHT = 2;
  private static readonly DEFAULT_COLOR = { r: 0.5, g: 0.5, b: 0.5 };

  /**
   * Convert a Canvas edge to FigJam connector
   */
  static async convertEdge(
    edge: CanvasEdge,
    nodeMap: FigJamNodeMap
  ): Promise<ConnectorNode | null> {
    try {
      const fromNode = nodeMap[edge.fromNode];
      const toNode = nodeMap[edge.toNode];

      if (!fromNode || !toNode) {
        console.warn(
          `Cannot create connector: missing nodes for edge ${edge.id}`
        );
        return null;
      }

      // Create connector
      const connector = figma.createConnector();

      // Set connection points using the proper FigJam API
      connector.connectorStart = {
        endpointNodeId: fromNode.id,
        magnet: this.getSideMagnet(edge.fromSide || 'right'),
      };

      connector.connectorEnd = {
        endpointNodeId: toNode.id,
        magnet: this.getSideMagnet(edge.toSide || 'left'),
      };

      // Set appearance
      connector.strokeWeight = this.DEFAULT_STROKE_WEIGHT;
      connector.strokes = [
        {
          type: 'SOLID',
          color: edge.color
            ? this.parseColor(edge.color)
            : this.DEFAULT_COLOR,
        },
      ];

      // Set arrow ends if specified
      if (edge.fromEnd === 'arrow') {
        connector.connectorStartStrokeCap = 'ARROW_LINES';
      }
      if (edge.toEnd === 'arrow' || (!edge.fromEnd && !edge.toEnd)) {
        // Default to arrow at the end if no specification
        connector.connectorEndStrokeCap = 'ARROW_LINES';
      }

      // Set name
      connector.name =
        edge.label || `Connector: ${edge.fromNode} → ${edge.toNode}`;

      // Add label if provided
      if (edge.label) {
        await this.addConnectorLabel(connector, edge.label);
      }

      return connector;
    } catch (error) {
      console.error(`Failed to convert edge ${edge.id}:`, error);
      return null;
    }
  }

  /**
   * Add a text label to a connector
   */
  private static async addConnectorLabel(
    connector: ConnectorNode,
    labelText: string
  ): Promise<void> {
    try {
      const textNode = figma.createText();
      await figma.loadFontAsync({
        family: 'Inter',
        style: 'Regular',
      });

      textNode.characters = labelText;
      textNode.fontSize = 12;
      textNode.fills = [
        { type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } },
      ];

      // For now, position the label near the connector
      // In a real implementation, you'd want to calculate the midpoint
      textNode.x = connector.x;
      textNode.y = connector.y - 20;

      textNode.name = `Label: ${labelText}`;
    } catch (error) {
      console.warn('Failed to add connector label:', error);
    }
  }

  /**
   * Convert side specification to FigJam magnet
   */
  private static getSideMagnet(
    side: string
  ): 'AUTO' | 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT' {
    switch (side.toLowerCase()) {
      case 'top':
        return 'TOP';
      case 'right':
        return 'RIGHT';
      case 'bottom':
        return 'BOTTOM';
      case 'left':
        return 'LEFT';
      default:
        return 'AUTO';
    }
  }

  /**
   * Get the center point of a node
   */
  private static getNodeCenter(
    node: BaseNode
  ): { x: number; y: number } | null {
    if (
      !node ||
      !('x' in node) ||
      !('y' in node) ||
      !('width' in node) ||
      !('height' in node)
    ) {
      return null;
    }

    const layoutNode = node as LayoutMixin;
    return {
      x: layoutNode.x + layoutNode.width / 2,
      y: layoutNode.y + layoutNode.height / 2,
    };
  }

  /**
   * Parse color string to RGB object
   */
  private static parseColor(colorString: string): {
    r: number;
    g: number;
    b: number;
  } {
    // Handle hex colors
    if (colorString.startsWith('#')) {
      return this.hexToRgb(colorString);
    }

    // Handle rgb() colors
    if (colorString.startsWith('rgb')) {
      const values = colorString.match(/\d+/g);
      if (values && values.length >= 3) {
        return {
          r: parseInt(values[0]) / 255,
          g: parseInt(values[1]) / 255,
          b: parseInt(values[2]) / 255,
        };
      }
    }

    // Handle named colors (basic set)
    const namedColors: {
      [key: string]: { r: number; g: number; b: number };
    } = {
      red: { r: 1, g: 0, b: 0 },
      green: { r: 0, g: 1, b: 0 },
      blue: { r: 0, g: 0, b: 1 },
      yellow: { r: 1, g: 1, b: 0 },
      purple: { r: 0.5, g: 0, b: 0.5 },
      orange: { r: 1, g: 0.5, b: 0 },
      black: { r: 0, g: 0, b: 0 },
      white: { r: 1, g: 1, b: 1 },
      gray: { r: 0.5, g: 0.5, b: 0.5 },
    };

    return (
      namedColors[colorString.toLowerCase()] || this.DEFAULT_COLOR
    );
  }

  /**
   * Convert hex color to RGB object
   */
  private static hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
  } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      hex
    );
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : this.DEFAULT_COLOR;
  }

  /**
   * Batch create connectors for multiple edges
   */
  static async convertEdges(
    edges: CanvasEdge[],
    nodeMap: FigJamNodeMap,
    onProgress?: (current: number, total: number) => void
  ): Promise<ConnectorNode[]> {
    const connectors: ConnectorNode[] = [];

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const connector = await this.convertEdge(edge, nodeMap);

      if (connector) {
        connectors.push(connector);
      }

      // Report progress
      if (onProgress) {
        onProgress(i + 1, edges.length);
      }
    }

    return connectors;
  }

  /**
   * Validate that all edge references exist in the node map
   */
  static validateEdgeReferences(
    edges: CanvasEdge[],
    nodeMap: FigJamNodeMap
  ): {
    valid: CanvasEdge[];
    invalid: { edge: CanvasEdge; reason: string }[];
  } {
    const valid: CanvasEdge[] = [];
    const invalid: { edge: CanvasEdge; reason: string }[] = [];

    for (const edge of edges) {
      if (!nodeMap[edge.fromNode]) {
        invalid.push({
          edge,
          reason: `From node '${edge.fromNode}' not found`,
        });
        continue;
      }

      if (!nodeMap[edge.toNode]) {
        invalid.push({
          edge,
          reason: `To node '${edge.toNode}' not found`,
        });
        continue;
      }

      valid.push(edge);
    }

    return { valid, invalid };
  }
}
