import {
  CanvasParser,
  CanvasParserError,
} from '../src/parser/canvasParser';
import { CanvasData } from '../src/parser/typeDefinitions';

describe('CanvasParser', () => {
  describe('parseCanvasFile', () => {
    it('should parse a valid canvas file', () => {
      const validCanvas = JSON.stringify({
        nodes: [
          {
            id: 'test-node',
            type: 'text',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            text: 'Test content',
          },
        ],
        edges: [],
      });

      const result = CanvasParser.parseCanvasFile(validCanvas);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe('test-node');
      expect(result.nodes[0].type).toBe('text');
      expect(result.edges).toHaveLength(0);
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json }';

      expect(() => {
        CanvasParser.parseCanvasFile(invalidJson);
      }).toThrow(CanvasParserError);
    });

    it('should validate required node properties', () => {
      const invalidCanvas = JSON.stringify({
        nodes: [
          {
            id: 'test-node',
            // missing type, x, y, width, height
          },
        ],
        edges: [],
      });

      expect(() => {
        CanvasParser.parseCanvasFile(invalidCanvas);
      }).toThrow(CanvasParserError);
    });

    it('should validate node types', () => {
      const invalidTypeCanvas = JSON.stringify({
        nodes: [
          {
            id: 'test-node',
            type: 'invalid-type',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
          },
        ],
        edges: [],
      });

      expect(() => {
        CanvasParser.parseCanvasFile(invalidTypeCanvas);
      }).toThrow(CanvasParserError);
    });

    it('should validate text nodes have text content', () => {
      const textNodeWithoutText = JSON.stringify({
        nodes: [
          {
            id: 'test-node',
            type: 'text',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            // missing text property
          },
        ],
        edges: [],
      });

      expect(() => {
        CanvasParser.parseCanvasFile(textNodeWithoutText);
      }).toThrow(CanvasParserError);
    });

    it('should validate file nodes have file path', () => {
      const fileNodeWithoutFile = JSON.stringify({
        nodes: [
          {
            id: 'test-node',
            type: 'file',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            // missing file property
          },
        ],
        edges: [],
      });

      expect(() => {
        CanvasParser.parseCanvasFile(fileNodeWithoutFile);
      }).toThrow(CanvasParserError);
    });

    it('should validate link nodes have URL', () => {
      const linkNodeWithoutUrl = JSON.stringify({
        nodes: [
          {
            id: 'test-node',
            type: 'link',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            // missing url property
          },
        ],
        edges: [],
      });

      expect(() => {
        CanvasParser.parseCanvasFile(linkNodeWithoutUrl);
      }).toThrow(CanvasParserError);
    });

    it('should parse valid edges', () => {
      const canvasWithEdges = JSON.stringify({
        nodes: [
          {
            id: 'node1',
            type: 'text',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            text: 'Node 1',
          },
          {
            id: 'node2',
            type: 'text',
            x: 400,
            y: 100,
            width: 200,
            height: 100,
            text: 'Node 2',
          },
        ],
        edges: [
          {
            id: 'edge1',
            fromNode: 'node1',
            toNode: 'node2',
            fromSide: 'right',
            toSide: 'left',
            toEnd: 'arrow',
          },
        ],
      });

      const result = CanvasParser.parseCanvasFile(canvasWithEdges);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].fromNode).toBe('node1');
      expect(result.edges[0].toNode).toBe('node2');
      expect(result.edges[0].fromSide).toBe('right');
      expect(result.edges[0].toSide).toBe('left');
      expect(result.edges[0].toEnd).toBe('arrow');
    });

    it('should validate edge required properties', () => {
      const invalidEdgeCanvas = JSON.stringify({
        nodes: [],
        edges: [
          {
            id: 'edge1',
            // missing fromNode and toNode
          },
        ],
      });

      expect(() => {
        CanvasParser.parseCanvasFile(invalidEdgeCanvas);
      }).toThrow(CanvasParserError);
    });
  });

  describe('getCanvasBounds', () => {
    it('should calculate correct bounds for nodes', () => {
      const canvasData: CanvasData = {
        nodes: [
          {
            id: 'node1',
            type: 'text',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            text: 'Test',
          },
          {
            id: 'node2',
            type: 'text',
            x: 400,
            y: 300,
            width: 150,
            height: 80,
            text: 'Test 2',
          },
        ],
        edges: [],
      };

      const bounds = CanvasParser.getCanvasBounds(canvasData);

      expect(bounds.minX).toBe(100);
      expect(bounds.minY).toBe(100);
      expect(bounds.maxX).toBe(550); // 400 + 150
      expect(bounds.maxY).toBe(380); // 300 + 80
      expect(bounds.width).toBe(450); // 550 - 100
      expect(bounds.height).toBe(280); // 380 - 100
    });

    it('should return zero bounds for empty canvas', () => {
      const emptyCanvas: CanvasData = {
        nodes: [],
        edges: [],
      };

      const bounds = CanvasParser.getCanvasBounds(emptyCanvas);

      expect(bounds.minX).toBe(0);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxX).toBe(0);
      expect(bounds.maxY).toBe(0);
      expect(bounds.width).toBe(0);
      expect(bounds.height).toBe(0);
    });
  });
});
