/// <reference types="@figma/plugin-typings" />

import { CanvasNode, FigJamNodeMap } from '../parser/typeDefinitions';

export class NodeConverter {
  private static readonly SCALE_FACTOR = 1; // Adjust if needed for FigJam coordinate system
  private static readonly DEFAULT_COLORS = {
    text: '#FFEB3B', // Yellow for sticky notes
    file: '#E3F2FD', // Light blue for file references
    link: '#E8F5E8', // Light green for links
    group: '#F3E5F5', // Light purple for groups
  };

  /**
   * Convert a Canvas node to appropriate FigJam element
   */
  static async convertNode(
    node: CanvasNode,
    nodeMap: FigJamNodeMap
  ): Promise<BaseNode | null> {
    try {
      switch (node.type) {
        case 'text':
          return await this.convertTextNode(node);
        case 'file':
          return await this.convertFileNode(node);
        case 'link':
          return await this.convertLinkNode(node);
        case 'group':
          return await this.convertGroupNode(node);
        default:
          console.warn(
            `Unsupported node type: ${(node as any).type}`
          );
          return null;
      }
    } catch (error) {
      console.error(`Failed to convert node ${node.id}:`, error);
      return null;
    }
  }

  /**
   * Convert text node to FigJam sticky note
   */
  private static async convertTextNode(
    node: CanvasNode
  ): Promise<StickyNode> {
    const sticky = figma.createSticky();

    // Set position and size
    sticky.x = node.x * this.SCALE_FACTOR;
    sticky.y = node.y * this.SCALE_FACTOR;

    // Set content
    if (node.text) {
      await figma.loadFontAsync({
        family: 'Inter',
        style: 'Regular',
      });
      sticky.text.characters = node.text;
    }

    // Set color
    const color =
      this.parseColor(node.color) || this.DEFAULT_COLORS.text;
    sticky.fills = [{ type: 'SOLID', color: this.hexToRgb(color) }];

    // Set name for layer panel
    sticky.name = `Text: ${
      node.text?.substring(0, 30) || 'Untitled'
    }`;

    return sticky;
  }

  /**
   * Convert file node to FigJam text element with file reference
   */
  private static async convertFileNode(
    node: CanvasNode
  ): Promise<TextNode> {
    const textNode = figma.createText();

    // Set position and size
    textNode.x = node.x * this.SCALE_FACTOR;
    textNode.y = node.y * this.SCALE_FACTOR;
    textNode.resize(
      node.width * this.SCALE_FACTOR,
      node.height * this.SCALE_FACTOR
    );

    // Load font and set content
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const fileName = node.file
      ? this.extractFileName(node.file)
      : 'Unknown File';
    const displayText = `📄 ${fileName}${
      node.subpath ? ` → ${node.subpath}` : ''
    }`;
    textNode.characters = displayText;

    // Style the text
    textNode.fontSize = 14;
    textNode.fills = [
      { type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } },
    ];

    // Add background
    const background = figma.createRectangle();
    background.x = textNode.x - 8;
    background.y = textNode.y - 8;
    background.resize(textNode.width + 16, textNode.height + 16);
    background.fills = [
      {
        type: 'SOLID',
        color: this.hexToRgb(this.DEFAULT_COLORS.file),
      },
    ];
    background.cornerRadius = 8;

    // Group them together
    const group = figma.group(
      [background, textNode],
      figma.currentPage
    );
    group.name = `File: ${fileName}`;

    return textNode;
  }

  /**
   * Convert link node to FigJam shape with URL
   */
  private static async convertLinkNode(
    node: CanvasNode
  ): Promise<RectangleNode> {
    const rect = figma.createRectangle();

    // Set position and size
    rect.x = node.x * this.SCALE_FACTOR;
    rect.y = node.y * this.SCALE_FACTOR;
    rect.resize(
      node.width * this.SCALE_FACTOR,
      node.height * this.SCALE_FACTOR
    );

    // Set appearance
    rect.fills = [
      {
        type: 'SOLID',
        color: this.hexToRgb(this.DEFAULT_COLORS.link),
      },
    ];
    rect.cornerRadius = 8;
    rect.strokeWeight = 2;
    rect.strokes = [
      { type: 'SOLID', color: { r: 0.3, g: 0.7, b: 0.3 } },
    ];

    // Add URL as name and try to add text
    const urlDisplay = this.extractDomain(node.url || '');
    rect.name = `Link: ${urlDisplay}`;

    // Create text overlay
    const textNode = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    textNode.characters = `🔗 ${urlDisplay}`;
    textNode.fontSize = 12;
    textNode.fills = [
      { type: 'SOLID', color: { r: 0.1, g: 0.5, b: 0.1 } },
    ];

    // Center text in rectangle
    textNode.x = rect.x + (rect.width - textNode.width) / 2;
    textNode.y = rect.y + (rect.height - textNode.height) / 2;

    // Group them
    const group = figma.group([rect, textNode], figma.currentPage);
    group.name = `Link: ${urlDisplay}`;

    return rect;
  }

  /**
   * Convert group node to FigJam frame
   */
  private static async convertGroupNode(
    node: CanvasNode
  ): Promise<FrameNode> {
    const frame = figma.createFrame();

    // Set position and size
    frame.x = node.x * this.SCALE_FACTOR;
    frame.y = node.y * this.SCALE_FACTOR;
    frame.resize(
      node.width * this.SCALE_FACTOR,
      node.height * this.SCALE_FACTOR
    );

    // Set appearance
    frame.fills = [
      {
        type: 'SOLID',
        color: this.hexToRgb(
          node.background || this.DEFAULT_COLORS.group
        ),
        opacity: 0.1,
      },
    ];
    frame.strokeWeight = 2;
    frame.strokes = [
      {
        type: 'SOLID',
        color: this.hexToRgb(
          node.background || this.DEFAULT_COLORS.group
        ),
      },
    ];
    frame.strokeStyleId = 'dashed';
    frame.cornerRadius = 12;

    // Set name
    frame.name = node.label || 'Group';

    // Add label text if provided
    if (node.label) {
      const labelText = figma.createText();
      await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
      labelText.characters = node.label;
      labelText.fontSize = 16;
      labelText.fills = [
        { type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } },
      ];

      // Position label at top-left of frame
      labelText.x = frame.x + 12;
      labelText.y = frame.y + 12;

      // Add to frame
      frame.appendChild(labelText);
    }

    return frame;
  }

  /**
   * Calculate bounds for multiple nodes (useful for groups)
   */
  static calculateBounds(nodes: CanvasNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  // Utility methods
  private static parseColor(color?: string): string | null {
    if (!color) return null;
    // Handle different color formats (hex, rgb, named colors)
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb')) return this.rgbStringToHex(color);
    return color; // Assume it's a valid color name
  }

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
      : { r: 1, g: 1, b: 1 };
  }

  private static rgbStringToHex(rgb: string): string {
    // Convert "rgb(255, 255, 255)" to "#ffffff"
    const values = rgb.match(/\d+/g);
    if (!values || values.length < 3) return '#ffffff';

    const hex = values
      .slice(0, 3)
      .map((val) => parseInt(val).toString(16).padStart(2, '0'))
      .join('');
    return `#${hex}`;
  }

  private static extractFileName(filePath: string): string {
    return (
      filePath.split('/').pop()?.split('\\').pop() || 'Unknown File'
    );
  }

  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  }
}
