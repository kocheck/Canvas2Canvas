/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/converters/edgeConverter.ts":
/*!*****************************************!*\
  !*** ./src/converters/edgeConverter.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EdgeConverter: () => (/* binding */ EdgeConverter)
/* harmony export */ });
/// <reference types="@figma/plugin-typings" />
class EdgeConverter {
    /**
     * Convert a Canvas edge to FigJam connector
     */
    static async convertEdge(edge, nodeMap) {
        try {
            const fromNode = nodeMap[edge.fromNode];
            const toNode = nodeMap[edge.toNode];
            if (!fromNode || !toNode) {
                console.warn(`Cannot create connector: missing nodes for edge ${edge.id}`);
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
            connector.strokes = [{
                    type: 'SOLID',
                    color: edge.color ? this.parseColor(edge.color) : this.DEFAULT_COLOR
                }];
            // Set arrow ends if specified
            if (edge.fromEnd === 'arrow') {
                connector.connectorStartStrokeCap = 'ARROW_LINES';
            }
            if (edge.toEnd === 'arrow' || (!edge.fromEnd && !edge.toEnd)) {
                // Default to arrow at the end if no specification
                connector.connectorEndStrokeCap = 'ARROW_LINES';
            }
            // Set name
            connector.name = edge.label || `Connector: ${edge.fromNode} → ${edge.toNode}`;
            // Add label if provided
            if (edge.label) {
                await this.addConnectorLabel(connector, edge.label);
            }
            return connector;
        }
        catch (error) {
            console.error(`Failed to convert edge ${edge.id}:`, error);
            return null;
        }
    }
    /**
     * Add a text label to a connector
     */
    static async addConnectorLabel(connector, labelText) {
        try {
            const textNode = figma.createText();
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            textNode.characters = labelText;
            textNode.fontSize = 12;
            textNode.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
            // For now, position the label near the connector
            // In a real implementation, you'd want to calculate the midpoint
            textNode.x = connector.x;
            textNode.y = connector.y - 20;
            textNode.name = `Label: ${labelText}`;
        }
        catch (error) {
            console.warn('Failed to add connector label:', error);
        }
    }
    /**
     * Convert side specification to FigJam magnet
     */
    static getSideMagnet(side) {
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
    static getNodeCenter(node) {
        if (!node || !('x' in node) || !('y' in node) || !('width' in node) || !('height' in node)) {
            return null;
        }
        const layoutNode = node;
        return {
            x: layoutNode.x + layoutNode.width / 2,
            y: layoutNode.y + layoutNode.height / 2,
        };
    }
    /**
     * Parse color string to RGB object
     */
    static parseColor(colorString) {
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
        const namedColors = {
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
        return namedColors[colorString.toLowerCase()] || this.DEFAULT_COLOR;
    }
    /**
     * Convert hex color to RGB object
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : this.DEFAULT_COLOR;
    }
    /**
     * Batch create connectors for multiple edges
     */
    static async convertEdges(edges, nodeMap, onProgress) {
        const connectors = [];
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
    static validateEdgeReferences(edges, nodeMap) {
        const valid = [];
        const invalid = [];
        for (const edge of edges) {
            if (!nodeMap[edge.fromNode]) {
                invalid.push({ edge, reason: `From node '${edge.fromNode}' not found` });
                continue;
            }
            if (!nodeMap[edge.toNode]) {
                invalid.push({ edge, reason: `To node '${edge.toNode}' not found` });
                continue;
            }
            valid.push(edge);
        }
        return { valid, invalid };
    }
}
EdgeConverter.DEFAULT_STROKE_WEIGHT = 2;
EdgeConverter.DEFAULT_COLOR = { r: 0.5, g: 0.5, b: 0.5 };


/***/ }),

/***/ "./src/converters/nodeConverter.ts":
/*!*****************************************!*\
  !*** ./src/converters/nodeConverter.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NodeConverter: () => (/* binding */ NodeConverter)
/* harmony export */ });
/// <reference types="@figma/plugin-typings" />
class NodeConverter {
    /**
     * Convert a Canvas node to appropriate FigJam element
     */
    static async convertNode(node, nodeMap) {
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
                    console.warn(`Unsupported node type: ${node.type}`);
                    return null;
            }
        }
        catch (error) {
            console.error(`Failed to convert node ${node.id}:`, error);
            return null;
        }
    }
    /**
     * Convert text node to FigJam sticky note
     */
    static async convertTextNode(node) {
        const sticky = figma.createSticky();
        // Set position and size
        sticky.x = node.x * this.SCALE_FACTOR;
        sticky.y = node.y * this.SCALE_FACTOR;
        // Set content
        if (node.text) {
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            sticky.text.characters = node.text;
        }
        // Set color
        const color = this.parseColor(node.color) || this.DEFAULT_COLORS.text;
        sticky.fills = [{ type: 'SOLID', color: this.hexToRgb(color) }];
        // Set name for layer panel
        sticky.name = `Text: ${node.text?.substring(0, 30) || 'Untitled'}`;
        return sticky;
    }
    /**
     * Convert file node to FigJam text element with file reference
     */
    static async convertFileNode(node) {
        const textNode = figma.createText();
        // Set position and size
        textNode.x = node.x * this.SCALE_FACTOR;
        textNode.y = node.y * this.SCALE_FACTOR;
        textNode.resize(node.width * this.SCALE_FACTOR, node.height * this.SCALE_FACTOR);
        // Load font and set content
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        const fileName = node.file ? this.extractFileName(node.file) : 'Unknown File';
        const displayText = `📄 ${fileName}${node.subpath ? ` → ${node.subpath}` : ''}`;
        textNode.characters = displayText;
        // Style the text
        textNode.fontSize = 14;
        textNode.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
        // Add background
        const background = figma.createRectangle();
        background.x = textNode.x - 8;
        background.y = textNode.y - 8;
        background.resize(textNode.width + 16, textNode.height + 16);
        background.fills = [{ type: 'SOLID', color: this.hexToRgb(this.DEFAULT_COLORS.file) }];
        background.cornerRadius = 8;
        // Group them together
        const group = figma.group([background, textNode], figma.currentPage);
        group.name = `File: ${fileName}`;
        return textNode;
    }
    /**
     * Convert link node to FigJam shape with URL
     */
    static async convertLinkNode(node) {
        const rect = figma.createRectangle();
        // Set position and size
        rect.x = node.x * this.SCALE_FACTOR;
        rect.y = node.y * this.SCALE_FACTOR;
        rect.resize(node.width * this.SCALE_FACTOR, node.height * this.SCALE_FACTOR);
        // Set appearance
        rect.fills = [{ type: 'SOLID', color: this.hexToRgb(this.DEFAULT_COLORS.link) }];
        rect.cornerRadius = 8;
        rect.strokeWeight = 2;
        rect.strokes = [{ type: 'SOLID', color: { r: 0.3, g: 0.7, b: 0.3 } }];
        // Add URL as name and try to add text
        const urlDisplay = this.extractDomain(node.url || '');
        rect.name = `Link: ${urlDisplay}`;
        // Create text overlay
        const textNode = figma.createText();
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        textNode.characters = `🔗 ${urlDisplay}`;
        textNode.fontSize = 12;
        textNode.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.5, b: 0.1 } }];
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
    static async convertGroupNode(node) {
        const frame = figma.createFrame();
        // Set position and size
        frame.x = node.x * this.SCALE_FACTOR;
        frame.y = node.y * this.SCALE_FACTOR;
        frame.resize(node.width * this.SCALE_FACTOR, node.height * this.SCALE_FACTOR);
        // Set appearance
        frame.fills = [{
                type: 'SOLID',
                color: this.hexToRgb(node.background || this.DEFAULT_COLORS.group),
                opacity: 0.1
            }];
        frame.strokeWeight = 2;
        frame.strokes = [{
                type: 'SOLID',
                color: this.hexToRgb(node.background || this.DEFAULT_COLORS.group)
            }];
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
            labelText.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
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
    static calculateBounds(nodes) {
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
    static parseColor(color) {
        if (!color)
            return null;
        // Handle different color formats (hex, rgb, named colors)
        if (color.startsWith('#'))
            return color;
        if (color.startsWith('rgb'))
            return this.rgbStringToHex(color);
        return color; // Assume it's a valid color name
    }
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 1, g: 1, b: 1 };
    }
    static rgbStringToHex(rgb) {
        // Convert "rgb(255, 255, 255)" to "#ffffff"
        const values = rgb.match(/\d+/g);
        if (!values || values.length < 3)
            return '#ffffff';
        const hex = values.slice(0, 3)
            .map(val => parseInt(val).toString(16).padStart(2, '0'))
            .join('');
        return `#${hex}`;
    }
    static extractFileName(filePath) {
        return filePath.split('/').pop()?.split('\\').pop() || 'Unknown File';
    }
    static extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        }
        catch {
            return url.length > 30 ? url.substring(0, 30) + '...' : url;
        }
    }
}
NodeConverter.SCALE_FACTOR = 1; // Adjust if needed for FigJam coordinate system
NodeConverter.DEFAULT_COLORS = {
    text: '#FFEB3B', // Yellow for sticky notes
    file: '#E3F2FD', // Light blue for file references
    link: '#E8F5E8', // Light green for links
    group: '#F3E5F5', // Light purple for groups
};


/***/ }),

/***/ "./src/parser/canvasParser.ts":
/*!************************************!*\
  !*** ./src/parser/canvasParser.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CanvasParser: () => (/* binding */ CanvasParser),
/* harmony export */   CanvasParserError: () => (/* binding */ CanvasParserError)
/* harmony export */ });
class CanvasParserError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'CanvasParserError';
    }
}
class CanvasParser {
    /**
     * Parse a Canvas file content into structured data
     */
    static parseCanvasFile(fileContent) {
        try {
            const jsonData = JSON.parse(fileContent);
            return this.validateAndParseCanvasData(jsonData);
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new CanvasParserError('Invalid JSON format in canvas file');
            }
            throw error;
        }
    }
    /**
     * Validate and parse the JSON data to ensure it matches Canvas format
     */
    static validateAndParseCanvasData(jsonData) {
        if (!jsonData || typeof jsonData !== 'object') {
            throw new CanvasParserError('Canvas file must contain a valid JSON object');
        }
        const nodes = this.validateNodes(jsonData.nodes || []);
        const edges = this.validateEdges(jsonData.edges || []);
        return { nodes, edges };
    }
    /**
     * Validate and parse canvas nodes
     */
    static validateNodes(nodesData) {
        if (!Array.isArray(nodesData)) {
            throw new CanvasParserError('Canvas nodes must be an array');
        }
        return nodesData.map((nodeData, index) => {
            try {
                return this.validateNode(nodeData);
            }
            catch (error) {
                throw new CanvasParserError(`Invalid node at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Validate a single canvas node
     */
    static validateNode(nodeData) {
        if (!nodeData || typeof nodeData !== 'object') {
            throw new Error('Node must be an object');
        }
        const { id, type, x, y, width, height } = nodeData;
        // Validate required fields
        if (!id || typeof id !== 'string') {
            throw new Error('Node must have a valid string id');
        }
        if (!type || !['text', 'file', 'link', 'group'].includes(type)) {
            throw new Error('Node must have a valid type (text, file, link, or group)');
        }
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error('Node must have valid numeric x and y coordinates');
        }
        if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
            throw new Error('Node must have valid positive width and height');
        }
        const node = {
            id,
            type,
            x,
            y,
            width,
            height,
        };
        // Add optional properties
        if (nodeData.color)
            node.color = nodeData.color;
        if (nodeData.text)
            node.text = nodeData.text;
        if (nodeData.file)
            node.file = nodeData.file;
        if (nodeData.subpath)
            node.subpath = nodeData.subpath;
        if (nodeData.url)
            node.url = nodeData.url;
        if (nodeData.label)
            node.label = nodeData.label;
        if (nodeData.background)
            node.background = nodeData.background;
        if (nodeData.backgroundStyle)
            node.backgroundStyle = nodeData.backgroundStyle;
        // Type-specific validation
        this.validateNodeTypeSpecific(node);
        return node;
    }
    /**
     * Validate type-specific node properties
     */
    static validateNodeTypeSpecific(node) {
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
    static validateEdges(edgesData) {
        if (!Array.isArray(edgesData)) {
            throw new CanvasParserError('Canvas edges must be an array');
        }
        return edgesData.map((edgeData, index) => {
            try {
                return this.validateEdge(edgeData);
            }
            catch (error) {
                throw new CanvasParserError(`Invalid edge at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Validate a single canvas edge
     */
    static validateEdge(edgeData) {
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
        const edge = {
            id,
            fromNode,
            toNode,
        };
        // Add optional properties
        if (edgeData.fromSide && ['top', 'right', 'bottom', 'left'].includes(edgeData.fromSide)) {
            edge.fromSide = edgeData.fromSide;
        }
        if (edgeData.toSide && ['top', 'right', 'bottom', 'left'].includes(edgeData.toSide)) {
            edge.toSide = edgeData.toSide;
        }
        if (edgeData.fromEnd && ['none', 'arrow'].includes(edgeData.fromEnd)) {
            edge.fromEnd = edgeData.fromEnd;
        }
        if (edgeData.toEnd && ['none', 'arrow'].includes(edgeData.toEnd)) {
            edge.toEnd = edgeData.toEnd;
        }
        if (edgeData.color)
            edge.color = edgeData.color;
        if (edgeData.label)
            edge.label = edgeData.label;
        return edge;
    }
    /**
     * Get canvas bounds for scaling purposes
     */
    static getCanvasBounds(canvasData) {
        if (canvasData.nodes.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handleCanvasImport: () => (/* binding */ handleCanvasImport)
/* harmony export */ });
/* harmony import */ var _parser_canvasParser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parser/canvasParser */ "./src/parser/canvasParser.ts");
/* harmony import */ var _converters_nodeConverter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./converters/nodeConverter */ "./src/converters/nodeConverter.ts");
/* harmony import */ var _converters_edgeConverter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./converters/edgeConverter */ "./src/converters/edgeConverter.ts");
/// <reference types="@figma/plugin-typings" />



// Plugin main thread - handles the actual FigJam API calls
figma.showUI(__html__, {
    width: 320,
    height: 400,
    themeColors: true
});
// Message handling from UI
figma.ui.onmessage = async (msg) => {
    try {
        switch (msg.type) {
            case 'import-canvas':
                await handleCanvasImport(msg.fileContent);
                break;
            case 'cancel':
                figma.closePlugin();
                break;
            default:
                console.warn('Unknown message type:', msg.type);
        }
    }
    catch (error) {
        console.error('Plugin error:', error);
        figma.ui.postMessage({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
};
/**
 * Handle the canvas import process
 */
async function handleCanvasImport(fileContent) {
    let canvasData;
    // Send progress update
    const sendProgress = (progress) => {
        figma.ui.postMessage({
            type: 'progress',
            progress
        });
    };
    try {
        // Stage 1: Parse the canvas file
        sendProgress({
            stage: 'parsing',
            progress: 10,
            message: 'Parsing canvas file...'
        });
        canvasData = _parser_canvasParser__WEBPACK_IMPORTED_MODULE_0__.CanvasParser.parseCanvasFile(fileContent);
        sendProgress({
            stage: 'parsing',
            progress: 25,
            message: `Found ${canvasData.nodes.length} nodes and ${canvasData.edges.length} edges`
        });
        // Stage 2: Convert nodes to FigJam elements
        sendProgress({
            stage: 'converting',
            progress: 30,
            message: 'Converting nodes to FigJam elements...'
        });
        const nodeMap = {};
        const conversionResults = {
            success: true,
            nodesCreated: 0,
            edgesCreated: 0,
            errors: [],
            warnings: []
        };
        // Convert nodes
        for (let i = 0; i < canvasData.nodes.length; i++) {
            const node = canvasData.nodes[i];
            try {
                const figJamNode = await _converters_nodeConverter__WEBPACK_IMPORTED_MODULE_1__.NodeConverter.convertNode(node, nodeMap);
                if (figJamNode) {
                    nodeMap[node.id] = figJamNode;
                    conversionResults.nodesCreated++;
                }
                else {
                    conversionResults.warnings.push(`Failed to convert node: ${node.id}`);
                }
            }
            catch (error) {
                const errorMsg = `Error converting node ${node.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                conversionResults.errors.push(errorMsg);
                console.error(errorMsg);
            }
            // Update progress
            const progress = 30 + (i / canvasData.nodes.length) * 40;
            sendProgress({
                stage: 'converting',
                progress,
                message: `Converting node ${i + 1} of ${canvasData.nodes.length}...`
            });
        }
        // Stage 3: Create connectors for edges
        sendProgress({
            stage: 'creating',
            progress: 70,
            message: 'Creating connectors...'
        });
        // Validate edge references
        const edgeValidation = _converters_edgeConverter__WEBPACK_IMPORTED_MODULE_2__.EdgeConverter.validateEdgeReferences(canvasData.edges, nodeMap);
        for (const invalidEdge of edgeValidation.invalid) {
            conversionResults.warnings.push(`Invalid edge: ${invalidEdge.reason}`);
        }
        // Convert valid edges
        const connectors = await _converters_edgeConverter__WEBPACK_IMPORTED_MODULE_2__.EdgeConverter.convertEdges(edgeValidation.valid, nodeMap, (current, total) => {
            const progress = 70 + (current / total) * 20;
            sendProgress({
                stage: 'creating',
                progress,
                message: `Creating connector ${current} of ${total}...`
            });
        });
        conversionResults.edgesCreated = connectors.length;
        // Stage 4: Finalize and position content
        sendProgress({
            stage: 'creating',
            progress: 90,
            message: 'Positioning content...'
        });
        await positionImportedContent(canvasData, nodeMap);
        // Stage 5: Complete
        sendProgress({
            stage: 'complete',
            progress: 100,
            message: `Import complete! Created ${conversionResults.nodesCreated} nodes and ${conversionResults.edgesCreated} connectors.`
        });
        // Send final results
        figma.ui.postMessage({
            type: 'import-complete',
            result: conversionResults
        });
        // Focus on the imported content
        if (Object.keys(nodeMap).length > 0) {
            const nodes = Object.values(nodeMap);
            figma.viewport.scrollAndZoomIntoView(nodes);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during import';
        sendProgress({
            stage: 'error',
            progress: 0,
            error: errorMessage
        });
        figma.ui.postMessage({
            type: 'error',
            message: errorMessage
        });
    }
}
/**
 * Position the imported content appropriately in the FigJam canvas
 */
async function positionImportedContent(canvasData, nodeMap) {
    if (Object.keys(nodeMap).length === 0)
        return;
    // Get current viewport center
    const viewport = figma.viewport;
    const viewportCenter = {
        x: viewport.center.x,
        y: viewport.center.y
    };
    // Get canvas bounds
    const bounds = _parser_canvasParser__WEBPACK_IMPORTED_MODULE_0__.CanvasParser.getCanvasBounds(canvasData);
    // Calculate offset to center the imported content in viewport
    const offsetX = viewportCenter.x - bounds.width / 2;
    const offsetY = viewportCenter.y - bounds.height / 2;
    // Apply offset to all imported nodes
    for (const figJamNode of Object.values(nodeMap)) {
        if ('x' in figJamNode && 'y' in figJamNode) {
            const layoutNode = figJamNode;
            layoutNode.x += offsetX;
            layoutNode.y += offsetY;
        }
    }
}
/**
 * Plugin cleanup
 */
figma.on('close', () => {
    // Cleanup if needed
});
// Export for testing purposes


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNwRCxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBRXJELHFDQUFxQztJQUNyQyxLQUFLLE1BQU0sVUFBVSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNoRCxJQUFJLEdBQUcsSUFBSSxVQUFVLElBQUksR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzNDLE1BQU0sVUFBVSxHQUFHLFVBQXlCLENBQUM7WUFDN0MsVUFBVSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUM7WUFDeEIsVUFBVSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7SUFDckIsb0JBQW9CO0FBQ3RCLENBQUMsQ0FBQyxDQUFDO0FBRUgsOEJBQThCO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYW52YXMyY2FudmFzLy4vc3JjL2NvbnZlcnRlcnMvZWRnZUNvbnZlcnRlci50cyIsIndlYnBhY2s6Ly9jYW52YXMyY2FudmFzLy4vc3JjL2NvbnZlcnRlcnMvbm9kZUNvbnZlcnRlci50cyIsIndlYnBhY2s6Ly9jYW52YXMyY2FudmFzLy4vc3JjL3BhcnNlci9jYW52YXNQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vY2FudmFzMmNhbnZhcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jYW52YXMyY2FudmFzL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jYW52YXMyY2FudmFzL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2FudmFzMmNhbnZhcy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NhbnZhczJjYW52YXMvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIkBmaWdtYS9wbHVnaW4tdHlwaW5nc1wiIC8+XG5cbmltcG9ydCB7IENhbnZhc0VkZ2UsIEZpZ0phbU5vZGVNYXAgfSBmcm9tICcuLi9wYXJzZXIvdHlwZURlZmluaXRpb25zJztcblxuZXhwb3J0IGNsYXNzIEVkZ2VDb252ZXJ0ZXIge1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBERUZBVUxUX1NUUk9LRV9XRUlHSFQgPSAyO1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBERUZBVUxUX0NPTE9SID0geyByOiAwLjUsIGc6IDAuNSwgYjogMC41IH07XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBDYW52YXMgZWRnZSB0byBGaWdKYW0gY29ubmVjdG9yXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY29udmVydEVkZ2UoXG4gICAgZWRnZTogQ2FudmFzRWRnZSwgXG4gICAgbm9kZU1hcDogRmlnSmFtTm9kZU1hcFxuICApOiBQcm9taXNlPENvbm5lY3Rvck5vZGUgfCBudWxsPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZyb21Ob2RlID0gbm9kZU1hcFtlZGdlLmZyb21Ob2RlXTtcbiAgICAgIGNvbnN0IHRvTm9kZSA9IG5vZGVNYXBbZWRnZS50b05vZGVdO1xuXG4gICAgICBpZiAoIWZyb21Ob2RlIHx8ICF0b05vZGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBDYW5ub3QgY3JlYXRlIGNvbm5lY3RvcjogbWlzc2luZyBub2RlcyBmb3IgZWRnZSAke2VkZ2UuaWR9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgY29ubmVjdG9yXG4gICAgICBjb25zdCBjb25uZWN0b3IgPSBmaWdtYS5jcmVhdGVDb25uZWN0b3IoKTtcbiAgICAgIFxuICAgICAgLy8gU2V0IGNvbm5lY3Rpb24gcG9pbnRzIHVzaW5nIHRoZSBwcm9wZXIgRmlnSmFtIEFQSVxuICAgICAgY29ubmVjdG9yLmNvbm5lY3RvclN0YXJ0ID0ge1xuICAgICAgICBlbmRwb2ludE5vZGVJZDogZnJvbU5vZGUuaWQsXG4gICAgICAgIG1hZ25ldDogdGhpcy5nZXRTaWRlTWFnbmV0KGVkZ2UuZnJvbVNpZGUgfHwgJ3JpZ2h0JyksXG4gICAgICB9O1xuICAgICAgXG4gICAgICBjb25uZWN0b3IuY29ubmVjdG9yRW5kID0ge1xuICAgICAgICBlbmRwb2ludE5vZGVJZDogdG9Ob2RlLmlkLFxuICAgICAgICBtYWduZXQ6IHRoaXMuZ2V0U2lkZU1hZ25ldChlZGdlLnRvU2lkZSB8fCAnbGVmdCcpLFxuICAgICAgfTtcblxuICAgICAgLy8gU2V0IGFwcGVhcmFuY2VcbiAgICAgIGNvbm5lY3Rvci5zdHJva2VXZWlnaHQgPSB0aGlzLkRFRkFVTFRfU1RST0tFX1dFSUdIVDtcbiAgICAgIGNvbm5lY3Rvci5zdHJva2VzID0gW3sgXG4gICAgICAgIHR5cGU6ICdTT0xJRCcsIFxuICAgICAgICBjb2xvcjogZWRnZS5jb2xvciA/IHRoaXMucGFyc2VDb2xvcihlZGdlLmNvbG9yKSA6IHRoaXMuREVGQVVMVF9DT0xPUiBcbiAgICAgIH1dO1xuXG4gICAgICAvLyBTZXQgYXJyb3cgZW5kcyBpZiBzcGVjaWZpZWRcbiAgICAgIGlmIChlZGdlLmZyb21FbmQgPT09ICdhcnJvdycpIHtcbiAgICAgICAgY29ubmVjdG9yLmNvbm5lY3RvclN0YXJ0U3Ryb2tlQ2FwID0gJ0FSUk9XX0xJTkVTJztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLnRvRW5kID09PSAnYXJyb3cnIHx8ICghZWRnZS5mcm9tRW5kICYmICFlZGdlLnRvRW5kKSkge1xuICAgICAgICAvLyBEZWZhdWx0IHRvIGFycm93IGF0IHRoZSBlbmQgaWYgbm8gc3BlY2lmaWNhdGlvblxuICAgICAgICBjb25uZWN0b3IuY29ubmVjdG9yRW5kU3Ryb2tlQ2FwID0gJ0FSUk9XX0xJTkVTJztcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IG5hbWVcbiAgICAgIGNvbm5lY3Rvci5uYW1lID0gZWRnZS5sYWJlbCB8fCBgQ29ubmVjdG9yOiAke2VkZ2UuZnJvbU5vZGV9IOKGkiAke2VkZ2UudG9Ob2RlfWA7XG5cbiAgICAgIC8vIEFkZCBsYWJlbCBpZiBwcm92aWRlZFxuICAgICAgaWYgKGVkZ2UubGFiZWwpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hZGRDb25uZWN0b3JMYWJlbChjb25uZWN0b3IsIGVkZ2UubGFiZWwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29ubmVjdG9yO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gY29udmVydCBlZGdlICR7ZWRnZS5pZH06YCwgZXJyb3IpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRleHQgbGFiZWwgdG8gYSBjb25uZWN0b3JcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGFzeW5jIGFkZENvbm5lY3RvckxhYmVsKFxuICAgIGNvbm5lY3RvcjogQ29ubmVjdG9yTm9kZSwgXG4gICAgbGFiZWxUZXh0OiBzdHJpbmdcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRleHROb2RlID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgICAgYXdhaXQgZmlnbWEubG9hZEZvbnRBc3luYyh7IGZhbWlseTogJ0ludGVyJywgc3R5bGU6ICdSZWd1bGFyJyB9KTtcbiAgICAgIFxuICAgICAgdGV4dE5vZGUuY2hhcmFjdGVycyA9IGxhYmVsVGV4dDtcbiAgICAgIHRleHROb2RlLmZvbnRTaXplID0gMTI7XG4gICAgICB0ZXh0Tm9kZS5maWxscyA9IFt7IHR5cGU6ICdTT0xJRCcsIGNvbG9yOiB7IHI6IDAuMywgZzogMC4zLCBiOiAwLjMgfSB9XTtcbiAgICAgIFxuICAgICAgLy8gRm9yIG5vdywgcG9zaXRpb24gdGhlIGxhYmVsIG5lYXIgdGhlIGNvbm5lY3RvclxuICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB5b3UnZCB3YW50IHRvIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnRcbiAgICAgIHRleHROb2RlLnggPSBjb25uZWN0b3IueDtcbiAgICAgIHRleHROb2RlLnkgPSBjb25uZWN0b3IueSAtIDIwO1xuXG4gICAgICB0ZXh0Tm9kZS5uYW1lID0gYExhYmVsOiAke2xhYmVsVGV4dH1gO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBhZGQgY29ubmVjdG9yIGxhYmVsOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBzaWRlIHNwZWNpZmljYXRpb24gdG8gRmlnSmFtIG1hZ25ldFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0U2lkZU1hZ25ldChzaWRlOiBzdHJpbmcpOiAnQVVUTycgfCAnVE9QJyB8ICdSSUdIVCcgfCAnQk9UVE9NJyB8ICdMRUZUJyB7XG4gICAgc3dpdGNoIChzaWRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgIHJldHVybiAnVE9QJztcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgcmV0dXJuICdSSUdIVCc7XG4gICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICByZXR1cm4gJ0JPVFRPTSc7XG4gICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgcmV0dXJuICdMRUZUJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnQVVUTyc7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2VudGVyIHBvaW50IG9mIGEgbm9kZVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0Tm9kZUNlbnRlcihub2RlOiBCYXNlTm9kZSk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xuICAgIGlmICghbm9kZSB8fCAhKCd4JyBpbiBub2RlKSB8fCAhKCd5JyBpbiBub2RlKSB8fCAhKCd3aWR0aCcgaW4gbm9kZSkgfHwgISgnaGVpZ2h0JyBpbiBub2RlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGxheW91dE5vZGUgPSBub2RlIGFzIExheW91dE1peGluO1xuICAgIHJldHVybiB7XG4gICAgICB4OiBsYXlvdXROb2RlLnggKyBsYXlvdXROb2RlLndpZHRoIC8gMixcbiAgICAgIHk6IGxheW91dE5vZGUueSArIGxheW91dE5vZGUuaGVpZ2h0IC8gMixcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGNvbG9yIHN0cmluZyB0byBSR0Igb2JqZWN0XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBwYXJzZUNvbG9yKGNvbG9yU3RyaW5nOiBzdHJpbmcpOiB7IHI6IG51bWJlcjsgZzogbnVtYmVyOyBiOiBudW1iZXIgfSB7XG4gICAgLy8gSGFuZGxlIGhleCBjb2xvcnNcbiAgICBpZiAoY29sb3JTdHJpbmcuc3RhcnRzV2l0aCgnIycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5oZXhUb1JnYihjb2xvclN0cmluZyk7XG4gICAgfVxuICAgIFxuICAgIC8vIEhhbmRsZSByZ2IoKSBjb2xvcnNcbiAgICBpZiAoY29sb3JTdHJpbmcuc3RhcnRzV2l0aCgncmdiJykpIHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IGNvbG9yU3RyaW5nLm1hdGNoKC9cXGQrL2cpO1xuICAgICAgaWYgKHZhbHVlcyAmJiB2YWx1ZXMubGVuZ3RoID49IDMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByOiBwYXJzZUludCh2YWx1ZXNbMF0pIC8gMjU1LFxuICAgICAgICAgIGc6IHBhcnNlSW50KHZhbHVlc1sxXSkgLyAyNTUsXG4gICAgICAgICAgYjogcGFyc2VJbnQodmFsdWVzWzJdKSAvIDI1NSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gSGFuZGxlIG5hbWVkIGNvbG9ycyAoYmFzaWMgc2V0KVxuICAgIGNvbnN0IG5hbWVkQ29sb3JzOiB7IFtrZXk6IHN0cmluZ106IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9IH0gPSB7XG4gICAgICByZWQ6IHsgcjogMSwgZzogMCwgYjogMCB9LFxuICAgICAgZ3JlZW46IHsgcjogMCwgZzogMSwgYjogMCB9LFxuICAgICAgYmx1ZTogeyByOiAwLCBnOiAwLCBiOiAxIH0sXG4gICAgICB5ZWxsb3c6IHsgcjogMSwgZzogMSwgYjogMCB9LFxuICAgICAgcHVycGxlOiB7IHI6IDAuNSwgZzogMCwgYjogMC41IH0sXG4gICAgICBvcmFuZ2U6IHsgcjogMSwgZzogMC41LCBiOiAwIH0sXG4gICAgICBibGFjazogeyByOiAwLCBnOiAwLCBiOiAwIH0sXG4gICAgICB3aGl0ZTogeyByOiAxLCBnOiAxLCBiOiAxIH0sXG4gICAgICBncmF5OiB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUgfSxcbiAgICB9O1xuICAgIFxuICAgIHJldHVybiBuYW1lZENvbG9yc1tjb2xvclN0cmluZy50b0xvd2VyQ2FzZSgpXSB8fCB0aGlzLkRFRkFVTFRfQ09MT1I7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBoZXggY29sb3IgdG8gUkdCIG9iamVjdFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaGV4VG9SZ2IoaGV4OiBzdHJpbmcpOiB7IHI6IG51bWJlcjsgZzogbnVtYmVyOyBiOiBudW1iZXIgfSB7XG4gICAgY29uc3QgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpIC8gMjU1LFxuICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNikgLyAyNTUsXG4gICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxuICAgIH0gOiB0aGlzLkRFRkFVTFRfQ09MT1I7XG4gIH1cblxuICAvKipcbiAgICogQmF0Y2ggY3JlYXRlIGNvbm5lY3RvcnMgZm9yIG11bHRpcGxlIGVkZ2VzXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY29udmVydEVkZ2VzKFxuICAgIGVkZ2VzOiBDYW52YXNFZGdlW10sIFxuICAgIG5vZGVNYXA6IEZpZ0phbU5vZGVNYXAsXG4gICAgb25Qcm9ncmVzcz86IChjdXJyZW50OiBudW1iZXIsIHRvdGFsOiBudW1iZXIpID0+IHZvaWRcbiAgKTogUHJvbWlzZTxDb25uZWN0b3JOb2RlW10+IHtcbiAgICBjb25zdCBjb25uZWN0b3JzOiBDb25uZWN0b3JOb2RlW10gPSBbXTtcbiAgICBcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gZWRnZXNbaV07XG4gICAgICBjb25zdCBjb25uZWN0b3IgPSBhd2FpdCB0aGlzLmNvbnZlcnRFZGdlKGVkZ2UsIG5vZGVNYXApO1xuICAgICAgXG4gICAgICBpZiAoY29ubmVjdG9yKSB7XG4gICAgICAgIGNvbm5lY3RvcnMucHVzaChjb25uZWN0b3IpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBSZXBvcnQgcHJvZ3Jlc3NcbiAgICAgIGlmIChvblByb2dyZXNzKSB7XG4gICAgICAgIG9uUHJvZ3Jlc3MoaSArIDEsIGVkZ2VzLmxlbmd0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBjb25uZWN0b3JzO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoYXQgYWxsIGVkZ2UgcmVmZXJlbmNlcyBleGlzdCBpbiB0aGUgbm9kZSBtYXBcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUVkZ2VSZWZlcmVuY2VzKGVkZ2VzOiBDYW52YXNFZGdlW10sIG5vZGVNYXA6IEZpZ0phbU5vZGVNYXApOiB7XG4gICAgdmFsaWQ6IENhbnZhc0VkZ2VbXTtcbiAgICBpbnZhbGlkOiB7IGVkZ2U6IENhbnZhc0VkZ2U7IHJlYXNvbjogc3RyaW5nIH1bXTtcbiAgfSB7XG4gICAgY29uc3QgdmFsaWQ6IENhbnZhc0VkZ2VbXSA9IFtdO1xuICAgIGNvbnN0IGludmFsaWQ6IHsgZWRnZTogQ2FudmFzRWRnZTsgcmVhc29uOiBzdHJpbmcgfVtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGVkZ2Ugb2YgZWRnZXMpIHtcbiAgICAgIGlmICghbm9kZU1hcFtlZGdlLmZyb21Ob2RlXSkge1xuICAgICAgICBpbnZhbGlkLnB1c2goeyBlZGdlLCByZWFzb246IGBGcm9tIG5vZGUgJyR7ZWRnZS5mcm9tTm9kZX0nIG5vdCBmb3VuZGAgfSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIW5vZGVNYXBbZWRnZS50b05vZGVdKSB7XG4gICAgICAgIGludmFsaWQucHVzaCh7IGVkZ2UsIHJlYXNvbjogYFRvIG5vZGUgJyR7ZWRnZS50b05vZGV9JyBub3QgZm91bmRgIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFsaWQucHVzaChlZGdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyB2YWxpZCwgaW52YWxpZCB9O1xuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIkBmaWdtYS9wbHVnaW4tdHlwaW5nc1wiIC8+XG5cbmltcG9ydCB7IENhbnZhc05vZGUsIEZpZ0phbU5vZGVNYXAgfSBmcm9tICcuLi9wYXJzZXIvdHlwZURlZmluaXRpb25zJztcblxuZXhwb3J0IGNsYXNzIE5vZGVDb252ZXJ0ZXIge1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBTQ0FMRV9GQUNUT1IgPSAxOyAvLyBBZGp1c3QgaWYgbmVlZGVkIGZvciBGaWdKYW0gY29vcmRpbmF0ZSBzeXN0ZW1cbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9DT0xPUlMgPSB7XG4gICAgdGV4dDogJyNGRkVCM0InLCAvLyBZZWxsb3cgZm9yIHN0aWNreSBub3Rlc1xuICAgIGZpbGU6ICcjRTNGMkZEJywgLy8gTGlnaHQgYmx1ZSBmb3IgZmlsZSByZWZlcmVuY2VzXG4gICAgbGluazogJyNFOEY1RTgnLCAvLyBMaWdodCBncmVlbiBmb3IgbGlua3NcbiAgICBncm91cDogJyNGM0U1RjUnLCAvLyBMaWdodCBwdXJwbGUgZm9yIGdyb3Vwc1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgQ2FudmFzIG5vZGUgdG8gYXBwcm9wcmlhdGUgRmlnSmFtIGVsZW1lbnRcbiAgICovXG4gIHN0YXRpYyBhc3luYyBjb252ZXJ0Tm9kZShub2RlOiBDYW52YXNOb2RlLCBub2RlTWFwOiBGaWdKYW1Ob2RlTWFwKTogUHJvbWlzZTxCYXNlTm9kZSB8IG51bGw+IHtcbiAgICB0cnkge1xuICAgICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY29udmVydFRleHROb2RlKG5vZGUpO1xuICAgICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jb252ZXJ0RmlsZU5vZGUobm9kZSk7XG4gICAgICAgIGNhc2UgJ2xpbmsnOlxuICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbnZlcnRMaW5rTm9kZShub2RlKTtcbiAgICAgICAgY2FzZSAnZ3JvdXAnOlxuICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbnZlcnRHcm91cE5vZGUobm9kZSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKGBVbnN1cHBvcnRlZCBub2RlIHR5cGU6ICR7KG5vZGUgYXMgYW55KS50eXBlfWApO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gY29udmVydCBub2RlICR7bm9kZS5pZH06YCwgZXJyb3IpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdGV4dCBub2RlIHRvIEZpZ0phbSBzdGlja3kgbm90ZVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgY29udmVydFRleHROb2RlKG5vZGU6IENhbnZhc05vZGUpOiBQcm9taXNlPFN0aWNreU5vZGU+IHtcbiAgICBjb25zdCBzdGlja3kgPSBmaWdtYS5jcmVhdGVTdGlja3koKTtcbiAgICBcbiAgICAvLyBTZXQgcG9zaXRpb24gYW5kIHNpemVcbiAgICBzdGlja3kueCA9IG5vZGUueCAqIHRoaXMuU0NBTEVfRkFDVE9SO1xuICAgIHN0aWNreS55ID0gbm9kZS55ICogdGhpcy5TQ0FMRV9GQUNUT1I7XG4gICAgXG4gICAgLy8gU2V0IGNvbnRlbnRcbiAgICBpZiAobm9kZS50ZXh0KSB7XG4gICAgICBhd2FpdCBmaWdtYS5sb2FkRm9udEFzeW5jKHsgZmFtaWx5OiAnSW50ZXInLCBzdHlsZTogJ1JlZ3VsYXInIH0pO1xuICAgICAgc3RpY2t5LnRleHQuY2hhcmFjdGVycyA9IG5vZGUudGV4dDtcbiAgICB9XG4gICAgXG4gICAgLy8gU2V0IGNvbG9yXG4gICAgY29uc3QgY29sb3IgPSB0aGlzLnBhcnNlQ29sb3Iobm9kZS5jb2xvcikgfHwgdGhpcy5ERUZBVUxUX0NPTE9SUy50ZXh0O1xuICAgIHN0aWNreS5maWxscyA9IFt7IHR5cGU6ICdTT0xJRCcsIGNvbG9yOiB0aGlzLmhleFRvUmdiKGNvbG9yKSB9XTtcbiAgICBcbiAgICAvLyBTZXQgbmFtZSBmb3IgbGF5ZXIgcGFuZWxcbiAgICBzdGlja3kubmFtZSA9IGBUZXh0OiAke25vZGUudGV4dD8uc3Vic3RyaW5nKDAsIDMwKSB8fCAnVW50aXRsZWQnfWA7XG4gICAgXG4gICAgcmV0dXJuIHN0aWNreTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGZpbGUgbm9kZSB0byBGaWdKYW0gdGV4dCBlbGVtZW50IHdpdGggZmlsZSByZWZlcmVuY2VcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGFzeW5jIGNvbnZlcnRGaWxlTm9kZShub2RlOiBDYW52YXNOb2RlKTogUHJvbWlzZTxUZXh0Tm9kZT4ge1xuICAgIGNvbnN0IHRleHROb2RlID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgIFxuICAgIC8vIFNldCBwb3NpdGlvbiBhbmQgc2l6ZVxuICAgIHRleHROb2RlLnggPSBub2RlLnggKiB0aGlzLlNDQUxFX0ZBQ1RPUjtcbiAgICB0ZXh0Tm9kZS55ID0gbm9kZS55ICogdGhpcy5TQ0FMRV9GQUNUT1I7XG4gICAgdGV4dE5vZGUucmVzaXplKG5vZGUud2lkdGggKiB0aGlzLlNDQUxFX0ZBQ1RPUiwgbm9kZS5oZWlnaHQgKiB0aGlzLlNDQUxFX0ZBQ1RPUik7XG4gICAgXG4gICAgLy8gTG9hZCBmb250IGFuZCBzZXQgY29udGVudFxuICAgIGF3YWl0IGZpZ21hLmxvYWRGb250QXN5bmMoeyBmYW1pbHk6ICdJbnRlcicsIHN0eWxlOiAnUmVndWxhcicgfSk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBub2RlLmZpbGUgPyB0aGlzLmV4dHJhY3RGaWxlTmFtZShub2RlLmZpbGUpIDogJ1Vua25vd24gRmlsZSc7XG4gICAgY29uc3QgZGlzcGxheVRleHQgPSBg8J+ThCAke2ZpbGVOYW1lfSR7bm9kZS5zdWJwYXRoID8gYCDihpIgJHtub2RlLnN1YnBhdGh9YCA6ICcnfWA7XG4gICAgdGV4dE5vZGUuY2hhcmFjdGVycyA9IGRpc3BsYXlUZXh0O1xuICAgIFxuICAgIC8vIFN0eWxlIHRoZSB0ZXh0XG4gICAgdGV4dE5vZGUuZm9udFNpemUgPSAxNDtcbiAgICB0ZXh0Tm9kZS5maWxscyA9IFt7IHR5cGU6ICdTT0xJRCcsIGNvbG9yOiB7IHI6IDAuMiwgZzogMC4yLCBiOiAwLjIgfSB9XTtcbiAgICBcbiAgICAvLyBBZGQgYmFja2dyb3VuZFxuICAgIGNvbnN0IGJhY2tncm91bmQgPSBmaWdtYS5jcmVhdGVSZWN0YW5nbGUoKTtcbiAgICBiYWNrZ3JvdW5kLnggPSB0ZXh0Tm9kZS54IC0gODtcbiAgICBiYWNrZ3JvdW5kLnkgPSB0ZXh0Tm9kZS55IC0gODtcbiAgICBiYWNrZ3JvdW5kLnJlc2l6ZSh0ZXh0Tm9kZS53aWR0aCArIDE2LCB0ZXh0Tm9kZS5oZWlnaHQgKyAxNik7XG4gICAgYmFja2dyb3VuZC5maWxscyA9IFt7IHR5cGU6ICdTT0xJRCcsIGNvbG9yOiB0aGlzLmhleFRvUmdiKHRoaXMuREVGQVVMVF9DT0xPUlMuZmlsZSkgfV07XG4gICAgYmFja2dyb3VuZC5jb3JuZXJSYWRpdXMgPSA4O1xuICAgIFxuICAgIC8vIEdyb3VwIHRoZW0gdG9nZXRoZXJcbiAgICBjb25zdCBncm91cCA9IGZpZ21hLmdyb3VwKFtiYWNrZ3JvdW5kLCB0ZXh0Tm9kZV0sIGZpZ21hLmN1cnJlbnRQYWdlKTtcbiAgICBncm91cC5uYW1lID0gYEZpbGU6ICR7ZmlsZU5hbWV9YDtcbiAgICBcbiAgICByZXR1cm4gdGV4dE5vZGU7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBsaW5rIG5vZGUgdG8gRmlnSmFtIHNoYXBlIHdpdGggVVJMXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhc3luYyBjb252ZXJ0TGlua05vZGUobm9kZTogQ2FudmFzTm9kZSk6IFByb21pc2U8UmVjdGFuZ2xlTm9kZT4ge1xuICAgIGNvbnN0IHJlY3QgPSBmaWdtYS5jcmVhdGVSZWN0YW5nbGUoKTtcbiAgICBcbiAgICAvLyBTZXQgcG9zaXRpb24gYW5kIHNpemVcbiAgICByZWN0LnggPSBub2RlLnggKiB0aGlzLlNDQUxFX0ZBQ1RPUjtcbiAgICByZWN0LnkgPSBub2RlLnkgKiB0aGlzLlNDQUxFX0ZBQ1RPUjtcbiAgICByZWN0LnJlc2l6ZShub2RlLndpZHRoICogdGhpcy5TQ0FMRV9GQUNUT1IsIG5vZGUuaGVpZ2h0ICogdGhpcy5TQ0FMRV9GQUNUT1IpO1xuICAgIFxuICAgIC8vIFNldCBhcHBlYXJhbmNlXG4gICAgcmVjdC5maWxscyA9IFt7IHR5cGU6ICdTT0xJRCcsIGNvbG9yOiB0aGlzLmhleFRvUmdiKHRoaXMuREVGQVVMVF9DT0xPUlMubGluaykgfV07XG4gICAgcmVjdC5jb3JuZXJSYWRpdXMgPSA4O1xuICAgIHJlY3Quc3Ryb2tlV2VpZ2h0ID0gMjtcbiAgICByZWN0LnN0cm9rZXMgPSBbeyB0eXBlOiAnU09MSUQnLCBjb2xvcjogeyByOiAwLjMsIGc6IDAuNywgYjogMC4zIH0gfV07XG4gICAgXG4gICAgLy8gQWRkIFVSTCBhcyBuYW1lIGFuZCB0cnkgdG8gYWRkIHRleHRcbiAgICBjb25zdCB1cmxEaXNwbGF5ID0gdGhpcy5leHRyYWN0RG9tYWluKG5vZGUudXJsIHx8ICcnKTtcbiAgICByZWN0Lm5hbWUgPSBgTGluazogJHt1cmxEaXNwbGF5fWA7XG4gICAgXG4gICAgLy8gQ3JlYXRlIHRleHQgb3ZlcmxheVxuICAgIGNvbnN0IHRleHROb2RlID0gZmlnbWEuY3JlYXRlVGV4dCgpO1xuICAgIGF3YWl0IGZpZ21hLmxvYWRGb250QXN5bmMoeyBmYW1pbHk6ICdJbnRlcicsIHN0eWxlOiAnUmVndWxhcicgfSk7XG4gICAgdGV4dE5vZGUuY2hhcmFjdGVycyA9IGDwn5SXICR7dXJsRGlzcGxheX1gO1xuICAgIHRleHROb2RlLmZvbnRTaXplID0gMTI7XG4gICAgdGV4dE5vZGUuZmlsbHMgPSBbeyB0eXBlOiAnU09MSUQnLCBjb2xvcjogeyByOiAwLjEsIGc6IDAuNSwgYjogMC4xIH0gfV07XG4gICAgXG4gICAgLy8gQ2VudGVyIHRleHQgaW4gcmVjdGFuZ2xlXG4gICAgdGV4dE5vZGUueCA9IHJlY3QueCArIChyZWN0LndpZHRoIC0gdGV4dE5vZGUud2lkdGgpIC8gMjtcbiAgICB0ZXh0Tm9kZS55ID0gcmVjdC55ICsgKHJlY3QuaGVpZ2h0IC0gdGV4dE5vZGUuaGVpZ2h0KSAvIDI7XG4gICAgXG4gICAgLy8gR3JvdXAgdGhlbVxuICAgIGNvbnN0IGdyb3VwID0gZmlnbWEuZ3JvdXAoW3JlY3QsIHRleHROb2RlXSwgZmlnbWEuY3VycmVudFBhZ2UpO1xuICAgIGdyb3VwLm5hbWUgPSBgTGluazogJHt1cmxEaXNwbGF5fWA7XG4gICAgXG4gICAgcmV0dXJuIHJlY3Q7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBncm91cCBub2RlIHRvIEZpZ0phbSBmcmFtZVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgY29udmVydEdyb3VwTm9kZShub2RlOiBDYW52YXNOb2RlKTogUHJvbWlzZTxGcmFtZU5vZGU+IHtcbiAgICBjb25zdCBmcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgXG4gICAgLy8gU2V0IHBvc2l0aW9uIGFuZCBzaXplXG4gICAgZnJhbWUueCA9IG5vZGUueCAqIHRoaXMuU0NBTEVfRkFDVE9SO1xuICAgIGZyYW1lLnkgPSBub2RlLnkgKiB0aGlzLlNDQUxFX0ZBQ1RPUjtcbiAgICBmcmFtZS5yZXNpemUobm9kZS53aWR0aCAqIHRoaXMuU0NBTEVfRkFDVE9SLCBub2RlLmhlaWdodCAqIHRoaXMuU0NBTEVfRkFDVE9SKTtcbiAgICBcbiAgICAvLyBTZXQgYXBwZWFyYW5jZVxuICAgIGZyYW1lLmZpbGxzID0gW3sgXG4gICAgICB0eXBlOiAnU09MSUQnLCBcbiAgICAgIGNvbG9yOiB0aGlzLmhleFRvUmdiKG5vZGUuYmFja2dyb3VuZCB8fCB0aGlzLkRFRkFVTFRfQ09MT1JTLmdyb3VwKSxcbiAgICAgIG9wYWNpdHk6IDAuMVxuICAgIH1dO1xuICAgIGZyYW1lLnN0cm9rZVdlaWdodCA9IDI7XG4gICAgZnJhbWUuc3Ryb2tlcyA9IFt7IFxuICAgICAgdHlwZTogJ1NPTElEJywgXG4gICAgICBjb2xvcjogdGhpcy5oZXhUb1JnYihub2RlLmJhY2tncm91bmQgfHwgdGhpcy5ERUZBVUxUX0NPTE9SUy5ncm91cClcbiAgICB9XTtcbiAgICBmcmFtZS5zdHJva2VTdHlsZUlkID0gJ2Rhc2hlZCc7XG4gICAgZnJhbWUuY29ybmVyUmFkaXVzID0gMTI7XG4gICAgXG4gICAgLy8gU2V0IG5hbWVcbiAgICBmcmFtZS5uYW1lID0gbm9kZS5sYWJlbCB8fCAnR3JvdXAnO1xuICAgIFxuICAgIC8vIEFkZCBsYWJlbCB0ZXh0IGlmIHByb3ZpZGVkXG4gICAgaWYgKG5vZGUubGFiZWwpIHtcbiAgICAgIGNvbnN0IGxhYmVsVGV4dCA9IGZpZ21hLmNyZWF0ZVRleHQoKTtcbiAgICAgIGF3YWl0IGZpZ21hLmxvYWRGb250QXN5bmMoeyBmYW1pbHk6ICdJbnRlcicsIHN0eWxlOiAnTWVkaXVtJyB9KTtcbiAgICAgIGxhYmVsVGV4dC5jaGFyYWN0ZXJzID0gbm9kZS5sYWJlbDtcbiAgICAgIGxhYmVsVGV4dC5mb250U2l6ZSA9IDE2O1xuICAgICAgbGFiZWxUZXh0LmZpbGxzID0gW3sgdHlwZTogJ1NPTElEJywgY29sb3I6IHsgcjogMC4zLCBnOiAwLjMsIGI6IDAuMyB9IH1dO1xuICAgICAgXG4gICAgICAvLyBQb3NpdGlvbiBsYWJlbCBhdCB0b3AtbGVmdCBvZiBmcmFtZVxuICAgICAgbGFiZWxUZXh0LnggPSBmcmFtZS54ICsgMTI7XG4gICAgICBsYWJlbFRleHQueSA9IGZyYW1lLnkgKyAxMjtcbiAgICAgIFxuICAgICAgLy8gQWRkIHRvIGZyYW1lXG4gICAgICBmcmFtZS5hcHBlbmRDaGlsZChsYWJlbFRleHQpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZnJhbWU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGJvdW5kcyBmb3IgbXVsdGlwbGUgbm9kZXMgKHVzZWZ1bCBmb3IgZ3JvdXBzKVxuICAgKi9cbiAgc3RhdGljIGNhbGN1bGF0ZUJvdW5kcyhub2RlczogQ2FudmFzTm9kZVtdKTogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSB7XG4gICAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgeDogMCwgeTogMCwgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAgfTtcbiAgICB9XG5cbiAgICBsZXQgbWluWCA9IEluZmluaXR5O1xuICAgIGxldCBtaW5ZID0gSW5maW5pdHk7XG4gICAgbGV0IG1heFggPSAtSW5maW5pdHk7XG4gICAgbGV0IG1heFkgPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIG1pblggPSBNYXRoLm1pbihtaW5YLCBub2RlLngpO1xuICAgICAgbWluWSA9IE1hdGgubWluKG1pblksIG5vZGUueSk7XG4gICAgICBtYXhYID0gTWF0aC5tYXgobWF4WCwgbm9kZS54ICsgbm9kZS53aWR0aCk7XG4gICAgICBtYXhZID0gTWF0aC5tYXgobWF4WSwgbm9kZS55ICsgbm9kZS5oZWlnaHQpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB4OiBtaW5YLFxuICAgICAgeTogbWluWSxcbiAgICAgIHdpZHRoOiBtYXhYIC0gbWluWCxcbiAgICAgIGhlaWdodDogbWF4WSAtIG1pblksXG4gICAgfTtcbiAgfVxuXG4gIC8vIFV0aWxpdHkgbWV0aG9kc1xuICBwcml2YXRlIHN0YXRpYyBwYXJzZUNvbG9yKGNvbG9yPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCFjb2xvcikgcmV0dXJuIG51bGw7XG4gICAgLy8gSGFuZGxlIGRpZmZlcmVudCBjb2xvciBmb3JtYXRzIChoZXgsIHJnYiwgbmFtZWQgY29sb3JzKVxuICAgIGlmIChjb2xvci5zdGFydHNXaXRoKCcjJykpIHJldHVybiBjb2xvcjtcbiAgICBpZiAoY29sb3Iuc3RhcnRzV2l0aCgncmdiJykpIHJldHVybiB0aGlzLnJnYlN0cmluZ1RvSGV4KGNvbG9yKTtcbiAgICByZXR1cm4gY29sb3I7IC8vIEFzc3VtZSBpdCdzIGEgdmFsaWQgY29sb3IgbmFtZVxuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgaGV4VG9SZ2IoaGV4OiBzdHJpbmcpOiB7IHI6IG51bWJlcjsgZzogbnVtYmVyOyBiOiBudW1iZXIgfSB7XG4gICAgY29uc3QgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgcmV0dXJuIHJlc3VsdCA/IHtcbiAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpIC8gMjU1LFxuICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNikgLyAyNTUsXG4gICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxuICAgIH0gOiB7IHI6IDEsIGc6IDEsIGI6IDEgfTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHJnYlN0cmluZ1RvSGV4KHJnYjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBDb252ZXJ0IFwicmdiKDI1NSwgMjU1LCAyNTUpXCIgdG8gXCIjZmZmZmZmXCJcbiAgICBjb25zdCB2YWx1ZXMgPSByZ2IubWF0Y2goL1xcZCsvZyk7XG4gICAgaWYgKCF2YWx1ZXMgfHwgdmFsdWVzLmxlbmd0aCA8IDMpIHJldHVybiAnI2ZmZmZmZic7XG4gICAgXG4gICAgY29uc3QgaGV4ID0gdmFsdWVzLnNsaWNlKDAsIDMpXG4gICAgICAubWFwKHZhbCA9PiBwYXJzZUludCh2YWwpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKVxuICAgICAgLmpvaW4oJycpO1xuICAgIHJldHVybiBgIyR7aGV4fWA7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBleHRyYWN0RmlsZU5hbWUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGZpbGVQYXRoLnNwbGl0KCcvJykucG9wKCk/LnNwbGl0KCdcXFxcJykucG9wKCkgfHwgJ1Vua25vd24gRmlsZSc7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBleHRyYWN0RG9tYWluKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTCh1cmwpO1xuICAgICAgcmV0dXJuIHVybE9iai5ob3N0bmFtZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiB1cmwubGVuZ3RoID4gMzAgPyB1cmwuc3Vic3RyaW5nKDAsIDMwKSArICcuLi4nIDogdXJsO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgQ2FudmFzRGF0YSwgQ2FudmFzTm9kZSwgQ2FudmFzRWRnZSB9IGZyb20gJy4vdHlwZURlZmluaXRpb25zJztcblxuZXhwb3J0IGNsYXNzIENhbnZhc1BhcnNlckVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSBjYXVzZT86IEVycm9yKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0NhbnZhc1BhcnNlckVycm9yJztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2FudmFzUGFyc2VyIHtcbiAgLyoqXG4gICAqIFBhcnNlIGEgQ2FudmFzIGZpbGUgY29udGVudCBpbnRvIHN0cnVjdHVyZWQgZGF0YVxuICAgKi9cbiAgc3RhdGljIHBhcnNlQ2FudmFzRmlsZShmaWxlQ29udGVudDogc3RyaW5nKTogQ2FudmFzRGF0YSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGpzb25EYXRhID0gSlNPTi5wYXJzZShmaWxlQ29udGVudCk7XG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZUFuZFBhcnNlQ2FudmFzRGF0YShqc29uRGF0YSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBDYW52YXNQYXJzZXJFcnJvcignSW52YWxpZCBKU09OIGZvcm1hdCBpbiBjYW52YXMgZmlsZScpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGFuZCBwYXJzZSB0aGUgSlNPTiBkYXRhIHRvIGVuc3VyZSBpdCBtYXRjaGVzIENhbnZhcyBmb3JtYXRcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHZhbGlkYXRlQW5kUGFyc2VDYW52YXNEYXRhKGpzb25EYXRhOiBhbnkpOiBDYW52YXNEYXRhIHtcbiAgICBpZiAoIWpzb25EYXRhIHx8IHR5cGVvZiBqc29uRGF0YSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBDYW52YXNQYXJzZXJFcnJvcignQ2FudmFzIGZpbGUgbXVzdCBjb250YWluIGEgdmFsaWQgSlNPTiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlcyA9IHRoaXMudmFsaWRhdGVOb2Rlcyhqc29uRGF0YS5ub2RlcyB8fCBbXSk7XG4gICAgY29uc3QgZWRnZXMgPSB0aGlzLnZhbGlkYXRlRWRnZXMoanNvbkRhdGEuZWRnZXMgfHwgW10pO1xuXG4gICAgcmV0dXJuIHsgbm9kZXMsIGVkZ2VzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgYW5kIHBhcnNlIGNhbnZhcyBub2Rlc1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdmFsaWRhdGVOb2Rlcyhub2Rlc0RhdGE6IGFueVtdKTogQ2FudmFzTm9kZVtdIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobm9kZXNEYXRhKSkge1xuICAgICAgdGhyb3cgbmV3IENhbnZhc1BhcnNlckVycm9yKCdDYW52YXMgbm9kZXMgbXVzdCBiZSBhbiBhcnJheScpO1xuICAgIH1cblxuICAgIHJldHVybiBub2Rlc0RhdGEubWFwKChub2RlRGF0YSwgaW5kZXgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlTm9kZShub2RlRGF0YSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgQ2FudmFzUGFyc2VyRXJyb3IoXG4gICAgICAgICAgYEludmFsaWQgbm9kZSBhdCBpbmRleCAke2luZGV4fTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgYSBzaW5nbGUgY2FudmFzIG5vZGVcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHZhbGlkYXRlTm9kZShub2RlRGF0YTogYW55KTogQ2FudmFzTm9kZSB7XG4gICAgaWYgKCFub2RlRGF0YSB8fCB0eXBlb2Ygbm9kZURhdGEgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGUgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGlkLCB0eXBlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0gPSBub2RlRGF0YTtcblxuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghaWQgfHwgdHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb2RlIG11c3QgaGF2ZSBhIHZhbGlkIHN0cmluZyBpZCcpO1xuICAgIH1cblxuICAgIGlmICghdHlwZSB8fCAhWyd0ZXh0JywgJ2ZpbGUnLCAnbGluaycsICdncm91cCddLmluY2x1ZGVzKHR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGUgbXVzdCBoYXZlIGEgdmFsaWQgdHlwZSAodGV4dCwgZmlsZSwgbGluaywgb3IgZ3JvdXApJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgeSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm9kZSBtdXN0IGhhdmUgdmFsaWQgbnVtZXJpYyB4IGFuZCB5IGNvb3JkaW5hdGVzJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB3aWR0aCAhPT0gJ251bWJlcicgfHwgdHlwZW9mIGhlaWdodCAhPT0gJ251bWJlcicgfHwgd2lkdGggPD0gMCB8fCBoZWlnaHQgPD0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb2RlIG11c3QgaGF2ZSB2YWxpZCBwb3NpdGl2ZSB3aWR0aCBhbmQgaGVpZ2h0Jyk7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZTogQ2FudmFzTm9kZSA9IHtcbiAgICAgIGlkLFxuICAgICAgdHlwZSxcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgfTtcblxuICAgIC8vIEFkZCBvcHRpb25hbCBwcm9wZXJ0aWVzXG4gICAgaWYgKG5vZGVEYXRhLmNvbG9yKSBub2RlLmNvbG9yID0gbm9kZURhdGEuY29sb3I7XG4gICAgaWYgKG5vZGVEYXRhLnRleHQpIG5vZGUudGV4dCA9IG5vZGVEYXRhLnRleHQ7XG4gICAgaWYgKG5vZGVEYXRhLmZpbGUpIG5vZGUuZmlsZSA9IG5vZGVEYXRhLmZpbGU7XG4gICAgaWYgKG5vZGVEYXRhLnN1YnBhdGgpIG5vZGUuc3VicGF0aCA9IG5vZGVEYXRhLnN1YnBhdGg7XG4gICAgaWYgKG5vZGVEYXRhLnVybCkgbm9kZS51cmwgPSBub2RlRGF0YS51cmw7XG4gICAgaWYgKG5vZGVEYXRhLmxhYmVsKSBub2RlLmxhYmVsID0gbm9kZURhdGEubGFiZWw7XG4gICAgaWYgKG5vZGVEYXRhLmJhY2tncm91bmQpIG5vZGUuYmFja2dyb3VuZCA9IG5vZGVEYXRhLmJhY2tncm91bmQ7XG4gICAgaWYgKG5vZGVEYXRhLmJhY2tncm91bmRTdHlsZSkgbm9kZS5iYWNrZ3JvdW5kU3R5bGUgPSBub2RlRGF0YS5iYWNrZ3JvdW5kU3R5bGU7XG5cbiAgICAvLyBUeXBlLXNwZWNpZmljIHZhbGlkYXRpb25cbiAgICB0aGlzLnZhbGlkYXRlTm9kZVR5cGVTcGVjaWZpYyhub2RlKTtcblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHR5cGUtc3BlY2lmaWMgbm9kZSBwcm9wZXJ0aWVzXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyB2YWxpZGF0ZU5vZGVUeXBlU3BlY2lmaWMobm9kZTogQ2FudmFzTm9kZSk6IHZvaWQge1xuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgaWYgKCFub2RlLnRleHQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RleHQgbm9kZSBtdXN0IGhhdmUgdGV4dCBjb250ZW50Jyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgaWYgKCFub2RlLmZpbGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgbm9kZSBtdXN0IGhhdmUgYSBmaWxlIHBhdGgnKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xpbmsnOlxuICAgICAgICBpZiAoIW5vZGUudXJsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMaW5rIG5vZGUgbXVzdCBoYXZlIGEgVVJMJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdncm91cCc6XG4gICAgICAgIC8vIEdyb3VwcyBjYW4gb3B0aW9uYWxseSBoYXZlIGxhYmVscywgbm8gc3RyaWN0IHJlcXVpcmVtZW50c1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgYW5kIHBhcnNlIGNhbnZhcyBlZGdlc1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdmFsaWRhdGVFZGdlcyhlZGdlc0RhdGE6IGFueVtdKTogQ2FudmFzRWRnZVtdIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZWRnZXNEYXRhKSkge1xuICAgICAgdGhyb3cgbmV3IENhbnZhc1BhcnNlckVycm9yKCdDYW52YXMgZWRnZXMgbXVzdCBiZSBhbiBhcnJheScpO1xuICAgIH1cblxuICAgIHJldHVybiBlZGdlc0RhdGEubWFwKChlZGdlRGF0YSwgaW5kZXgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlRWRnZShlZGdlRGF0YSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgQ2FudmFzUGFyc2VyRXJyb3IoXG4gICAgICAgICAgYEludmFsaWQgZWRnZSBhdCBpbmRleCAke2luZGV4fTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgYSBzaW5nbGUgY2FudmFzIGVkZ2VcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHZhbGlkYXRlRWRnZShlZGdlRGF0YTogYW55KTogQ2FudmFzRWRnZSB7XG4gICAgaWYgKCFlZGdlRGF0YSB8fCB0eXBlb2YgZWRnZURhdGEgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VkZ2UgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGlkLCBmcm9tTm9kZSwgdG9Ob2RlIH0gPSBlZGdlRGF0YTtcblxuICAgIGlmICghaWQgfHwgdHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFZGdlIG11c3QgaGF2ZSBhIHZhbGlkIHN0cmluZyBpZCcpO1xuICAgIH1cblxuICAgIGlmICghZnJvbU5vZGUgfHwgdHlwZW9mIGZyb21Ob2RlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFZGdlIG11c3QgaGF2ZSBhIHZhbGlkIGZyb21Ob2RlIGlkJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0b05vZGUgfHwgdHlwZW9mIHRvTm9kZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRWRnZSBtdXN0IGhhdmUgYSB2YWxpZCB0b05vZGUgaWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBlZGdlOiBDYW52YXNFZGdlID0ge1xuICAgICAgaWQsXG4gICAgICBmcm9tTm9kZSxcbiAgICAgIHRvTm9kZSxcbiAgICB9O1xuXG4gICAgLy8gQWRkIG9wdGlvbmFsIHByb3BlcnRpZXNcbiAgICBpZiAoZWRnZURhdGEuZnJvbVNpZGUgJiYgWyd0b3AnLCAncmlnaHQnLCAnYm90dG9tJywgJ2xlZnQnXS5pbmNsdWRlcyhlZGdlRGF0YS5mcm9tU2lkZSkpIHtcbiAgICAgIGVkZ2UuZnJvbVNpZGUgPSBlZGdlRGF0YS5mcm9tU2lkZTtcbiAgICB9XG4gICAgaWYgKGVkZ2VEYXRhLnRvU2lkZSAmJiBbJ3RvcCcsICdyaWdodCcsICdib3R0b20nLCAnbGVmdCddLmluY2x1ZGVzKGVkZ2VEYXRhLnRvU2lkZSkpIHtcbiAgICAgIGVkZ2UudG9TaWRlID0gZWRnZURhdGEudG9TaWRlO1xuICAgIH1cbiAgICBpZiAoZWRnZURhdGEuZnJvbUVuZCAmJiBbJ25vbmUnLCAnYXJyb3cnXS5pbmNsdWRlcyhlZGdlRGF0YS5mcm9tRW5kKSkge1xuICAgICAgZWRnZS5mcm9tRW5kID0gZWRnZURhdGEuZnJvbUVuZDtcbiAgICB9XG4gICAgaWYgKGVkZ2VEYXRhLnRvRW5kICYmIFsnbm9uZScsICdhcnJvdyddLmluY2x1ZGVzKGVkZ2VEYXRhLnRvRW5kKSkge1xuICAgICAgZWRnZS50b0VuZCA9IGVkZ2VEYXRhLnRvRW5kO1xuICAgIH1cbiAgICBpZiAoZWRnZURhdGEuY29sb3IpIGVkZ2UuY29sb3IgPSBlZGdlRGF0YS5jb2xvcjtcbiAgICBpZiAoZWRnZURhdGEubGFiZWwpIGVkZ2UubGFiZWwgPSBlZGdlRGF0YS5sYWJlbDtcblxuICAgIHJldHVybiBlZGdlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjYW52YXMgYm91bmRzIGZvciBzY2FsaW5nIHB1cnBvc2VzXG4gICAqL1xuICBzdGF0aWMgZ2V0Q2FudmFzQm91bmRzKGNhbnZhc0RhdGE6IENhbnZhc0RhdGEpOiB7IFxuICAgIG1pblg6IG51bWJlcjsgXG4gICAgbWluWTogbnVtYmVyOyBcbiAgICBtYXhYOiBudW1iZXI7IFxuICAgIG1heFk6IG51bWJlcjsgXG4gICAgd2lkdGg6IG51bWJlcjsgXG4gICAgaGVpZ2h0OiBudW1iZXI7IFxuICB9IHtcbiAgICBpZiAoY2FudmFzRGF0YS5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IG1pblg6IDAsIG1pblk6IDAsIG1heFg6IDAsIG1heFk6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcbiAgICB9XG5cbiAgICBsZXQgbWluWCA9IEluZmluaXR5O1xuICAgIGxldCBtaW5ZID0gSW5maW5pdHk7XG4gICAgbGV0IG1heFggPSAtSW5maW5pdHk7XG4gICAgbGV0IG1heFkgPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgY2FudmFzRGF0YS5ub2Rlcykge1xuICAgICAgbWluWCA9IE1hdGgubWluKG1pblgsIG5vZGUueCk7XG4gICAgICBtaW5ZID0gTWF0aC5taW4obWluWSwgbm9kZS55KTtcbiAgICAgIG1heFggPSBNYXRoLm1heChtYXhYLCBub2RlLnggKyBub2RlLndpZHRoKTtcbiAgICAgIG1heFkgPSBNYXRoLm1heChtYXhZLCBub2RlLnkgKyBub2RlLmhlaWdodCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1pblgsXG4gICAgICBtaW5ZLFxuICAgICAgbWF4WCxcbiAgICAgIG1heFksXG4gICAgICB3aWR0aDogbWF4WCAtIG1pblgsXG4gICAgICBoZWlnaHQ6IG1heFkgLSBtaW5ZLFxuICAgIH07XG4gIH1cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJAZmlnbWEvcGx1Z2luLXR5cGluZ3NcIiAvPlxuXG5pbXBvcnQgeyBDYW52YXNQYXJzZXIgfSBmcm9tICcuL3BhcnNlci9jYW52YXNQYXJzZXInO1xuaW1wb3J0IHsgTm9kZUNvbnZlcnRlciB9IGZyb20gJy4vY29udmVydGVycy9ub2RlQ29udmVydGVyJztcbmltcG9ydCB7IEVkZ2VDb252ZXJ0ZXIgfSBmcm9tICcuL2NvbnZlcnRlcnMvZWRnZUNvbnZlcnRlcic7XG5pbXBvcnQgeyBDYW52YXNEYXRhLCBJbXBvcnRQcm9ncmVzcywgQ29udmVyc2lvblJlc3VsdCwgRmlnSmFtTm9kZU1hcCB9IGZyb20gJy4vcGFyc2VyL3R5cGVEZWZpbml0aW9ucyc7XG5cbi8vIFBsdWdpbiBtYWluIHRocmVhZCAtIGhhbmRsZXMgdGhlIGFjdHVhbCBGaWdKYW0gQVBJIGNhbGxzXG5maWdtYS5zaG93VUkoX19odG1sX18sIHsgXG4gIHdpZHRoOiAzMjAsIFxuICBoZWlnaHQ6IDQwMCwgXG4gIHRoZW1lQ29sb3JzOiB0cnVlIFxufSk7XG5cbi8vIE1lc3NhZ2UgaGFuZGxpbmcgZnJvbSBVSVxuZmlnbWEudWkub25tZXNzYWdlID0gYXN5bmMgKG1zZykgPT4ge1xuICB0cnkge1xuICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2ltcG9ydC1jYW52YXMnOlxuICAgICAgICBhd2FpdCBoYW5kbGVDYW52YXNJbXBvcnQobXNnLmZpbGVDb250ZW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjYW5jZWwnOlxuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biBtZXNzYWdlIHR5cGU6JywgbXNnLnR5cGUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gZXJyb3I6JywgZXJyb3IpO1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJ1xuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgY2FudmFzIGltcG9ydCBwcm9jZXNzXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNhbnZhc0ltcG9ydChmaWxlQ29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBjYW52YXNEYXRhOiBDYW52YXNEYXRhO1xuICBcbiAgLy8gU2VuZCBwcm9ncmVzcyB1cGRhdGVcbiAgY29uc3Qgc2VuZFByb2dyZXNzID0gKHByb2dyZXNzOiBJbXBvcnRQcm9ncmVzcykgPT4ge1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdwcm9ncmVzcycsXG4gICAgICBwcm9ncmVzc1xuICAgIH0pO1xuICB9O1xuXG4gIHRyeSB7XG4gICAgLy8gU3RhZ2UgMTogUGFyc2UgdGhlIGNhbnZhcyBmaWxlXG4gICAgc2VuZFByb2dyZXNzKHtcbiAgICAgIHN0YWdlOiAncGFyc2luZycsXG4gICAgICBwcm9ncmVzczogMTAsXG4gICAgICBtZXNzYWdlOiAnUGFyc2luZyBjYW52YXMgZmlsZS4uLidcbiAgICB9KTtcblxuICAgIGNhbnZhc0RhdGEgPSBDYW52YXNQYXJzZXIucGFyc2VDYW52YXNGaWxlKGZpbGVDb250ZW50KTtcbiAgICBcbiAgICBzZW5kUHJvZ3Jlc3Moe1xuICAgICAgc3RhZ2U6ICdwYXJzaW5nJyxcbiAgICAgIHByb2dyZXNzOiAyNSxcbiAgICAgIG1lc3NhZ2U6IGBGb3VuZCAke2NhbnZhc0RhdGEubm9kZXMubGVuZ3RofSBub2RlcyBhbmQgJHtjYW52YXNEYXRhLmVkZ2VzLmxlbmd0aH0gZWRnZXNgXG4gICAgfSk7XG5cbiAgICAvLyBTdGFnZSAyOiBDb252ZXJ0IG5vZGVzIHRvIEZpZ0phbSBlbGVtZW50c1xuICAgIHNlbmRQcm9ncmVzcyh7XG4gICAgICBzdGFnZTogJ2NvbnZlcnRpbmcnLFxuICAgICAgcHJvZ3Jlc3M6IDMwLFxuICAgICAgbWVzc2FnZTogJ0NvbnZlcnRpbmcgbm9kZXMgdG8gRmlnSmFtIGVsZW1lbnRzLi4uJ1xuICAgIH0pO1xuXG4gICAgY29uc3Qgbm9kZU1hcDogRmlnSmFtTm9kZU1hcCA9IHt9O1xuICAgIGNvbnN0IGNvbnZlcnNpb25SZXN1bHRzOiBDb252ZXJzaW9uUmVzdWx0ID0ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIG5vZGVzQ3JlYXRlZDogMCxcbiAgICAgIGVkZ2VzQ3JlYXRlZDogMCxcbiAgICAgIGVycm9yczogW10sXG4gICAgICB3YXJuaW5nczogW11cbiAgICB9O1xuXG4gICAgLy8gQ29udmVydCBub2Rlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FudmFzRGF0YS5ub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZSA9IGNhbnZhc0RhdGEubm9kZXNbaV07XG4gICAgICBcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpZ0phbU5vZGUgPSBhd2FpdCBOb2RlQ29udmVydGVyLmNvbnZlcnROb2RlKG5vZGUsIG5vZGVNYXApO1xuICAgICAgICBpZiAoZmlnSmFtTm9kZSkge1xuICAgICAgICAgIG5vZGVNYXBbbm9kZS5pZF0gPSBmaWdKYW1Ob2RlO1xuICAgICAgICAgIGNvbnZlcnNpb25SZXN1bHRzLm5vZGVzQ3JlYXRlZCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnZlcnNpb25SZXN1bHRzLndhcm5pbmdzLnB1c2goYEZhaWxlZCB0byBjb252ZXJ0IG5vZGU6ICR7bm9kZS5pZH1gKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgRXJyb3IgY29udmVydGluZyBub2RlICR7bm9kZS5pZH06ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YDtcbiAgICAgICAgY29udmVyc2lvblJlc3VsdHMuZXJyb3JzLnB1c2goZXJyb3JNc2cpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yTXNnKTtcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHByb2dyZXNzXG4gICAgICBjb25zdCBwcm9ncmVzcyA9IDMwICsgKGkgLyBjYW52YXNEYXRhLm5vZGVzLmxlbmd0aCkgKiA0MDtcbiAgICAgIHNlbmRQcm9ncmVzcyh7XG4gICAgICAgIHN0YWdlOiAnY29udmVydGluZycsXG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICBtZXNzYWdlOiBgQ29udmVydGluZyBub2RlICR7aSArIDF9IG9mICR7Y2FudmFzRGF0YS5ub2Rlcy5sZW5ndGh9Li4uYFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU3RhZ2UgMzogQ3JlYXRlIGNvbm5lY3RvcnMgZm9yIGVkZ2VzXG4gICAgc2VuZFByb2dyZXNzKHtcbiAgICAgIHN0YWdlOiAnY3JlYXRpbmcnLFxuICAgICAgcHJvZ3Jlc3M6IDcwLFxuICAgICAgbWVzc2FnZTogJ0NyZWF0aW5nIGNvbm5lY3RvcnMuLi4nXG4gICAgfSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBlZGdlIHJlZmVyZW5jZXNcbiAgICBjb25zdCBlZGdlVmFsaWRhdGlvbiA9IEVkZ2VDb252ZXJ0ZXIudmFsaWRhdGVFZGdlUmVmZXJlbmNlcyhjYW52YXNEYXRhLmVkZ2VzLCBub2RlTWFwKTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGludmFsaWRFZGdlIG9mIGVkZ2VWYWxpZGF0aW9uLmludmFsaWQpIHtcbiAgICAgIGNvbnZlcnNpb25SZXN1bHRzLndhcm5pbmdzLnB1c2goYEludmFsaWQgZWRnZTogJHtpbnZhbGlkRWRnZS5yZWFzb259YCk7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCB2YWxpZCBlZGdlc1xuICAgIGNvbnN0IGNvbm5lY3RvcnMgPSBhd2FpdCBFZGdlQ29udmVydGVyLmNvbnZlcnRFZGdlcyhcbiAgICAgIGVkZ2VWYWxpZGF0aW9uLnZhbGlkLFxuICAgICAgbm9kZU1hcCxcbiAgICAgIChjdXJyZW50LCB0b3RhbCkgPT4ge1xuICAgICAgICBjb25zdCBwcm9ncmVzcyA9IDcwICsgKGN1cnJlbnQgLyB0b3RhbCkgKiAyMDtcbiAgICAgICAgc2VuZFByb2dyZXNzKHtcbiAgICAgICAgICBzdGFnZTogJ2NyZWF0aW5nJyxcbiAgICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgICBtZXNzYWdlOiBgQ3JlYXRpbmcgY29ubmVjdG9yICR7Y3VycmVudH0gb2YgJHt0b3RhbH0uLi5gXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBjb252ZXJzaW9uUmVzdWx0cy5lZGdlc0NyZWF0ZWQgPSBjb25uZWN0b3JzLmxlbmd0aDtcblxuICAgIC8vIFN0YWdlIDQ6IEZpbmFsaXplIGFuZCBwb3NpdGlvbiBjb250ZW50XG4gICAgc2VuZFByb2dyZXNzKHtcbiAgICAgIHN0YWdlOiAnY3JlYXRpbmcnLFxuICAgICAgcHJvZ3Jlc3M6IDkwLFxuICAgICAgbWVzc2FnZTogJ1Bvc2l0aW9uaW5nIGNvbnRlbnQuLi4nXG4gICAgfSk7XG5cbiAgICBhd2FpdCBwb3NpdGlvbkltcG9ydGVkQ29udGVudChjYW52YXNEYXRhLCBub2RlTWFwKTtcblxuICAgIC8vIFN0YWdlIDU6IENvbXBsZXRlXG4gICAgc2VuZFByb2dyZXNzKHtcbiAgICAgIHN0YWdlOiAnY29tcGxldGUnLFxuICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgIG1lc3NhZ2U6IGBJbXBvcnQgY29tcGxldGUhIENyZWF0ZWQgJHtjb252ZXJzaW9uUmVzdWx0cy5ub2Rlc0NyZWF0ZWR9IG5vZGVzIGFuZCAke2NvbnZlcnNpb25SZXN1bHRzLmVkZ2VzQ3JlYXRlZH0gY29ubmVjdG9ycy5gXG4gICAgfSk7XG5cbiAgICAvLyBTZW5kIGZpbmFsIHJlc3VsdHNcbiAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICB0eXBlOiAnaW1wb3J0LWNvbXBsZXRlJyxcbiAgICAgIHJlc3VsdDogY29udmVyc2lvblJlc3VsdHNcbiAgICB9KTtcblxuICAgIC8vIEZvY3VzIG9uIHRoZSBpbXBvcnRlZCBjb250ZW50XG4gICAgaWYgKE9iamVjdC5rZXlzKG5vZGVNYXApLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gT2JqZWN0LnZhbHVlcyhub2RlTWFwKTtcbiAgICAgIGZpZ21hLnZpZXdwb3J0LnNjcm9sbEFuZFpvb21JbnRvVmlldyhub2Rlcyk7XG4gICAgfVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCBkdXJpbmcgaW1wb3J0JztcbiAgICBcbiAgICBzZW5kUHJvZ3Jlc3Moe1xuICAgICAgc3RhZ2U6ICdlcnJvcicsXG4gICAgICBwcm9ncmVzczogMCxcbiAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2VcbiAgICB9KTtcblxuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICBtZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFBvc2l0aW9uIHRoZSBpbXBvcnRlZCBjb250ZW50IGFwcHJvcHJpYXRlbHkgaW4gdGhlIEZpZ0phbSBjYW52YXNcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcG9zaXRpb25JbXBvcnRlZENvbnRlbnQoY2FudmFzRGF0YTogQ2FudmFzRGF0YSwgbm9kZU1hcDogRmlnSmFtTm9kZU1hcCk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoT2JqZWN0LmtleXMobm9kZU1hcCkubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgLy8gR2V0IGN1cnJlbnQgdmlld3BvcnQgY2VudGVyXG4gIGNvbnN0IHZpZXdwb3J0ID0gZmlnbWEudmlld3BvcnQ7XG4gIGNvbnN0IHZpZXdwb3J0Q2VudGVyID0ge1xuICAgIHg6IHZpZXdwb3J0LmNlbnRlci54LFxuICAgIHk6IHZpZXdwb3J0LmNlbnRlci55XG4gIH07XG5cbiAgLy8gR2V0IGNhbnZhcyBib3VuZHNcbiAgY29uc3QgYm91bmRzID0gQ2FudmFzUGFyc2VyLmdldENhbnZhc0JvdW5kcyhjYW52YXNEYXRhKTtcbiAgXG4gIC8vIENhbGN1bGF0ZSBvZmZzZXQgdG8gY2VudGVyIHRoZSBpbXBvcnRlZCBjb250ZW50IGluIHZpZXdwb3J0XG4gIGNvbnN0IG9mZnNldFggPSB2aWV3cG9ydENlbnRlci54IC0gYm91bmRzLndpZHRoIC8gMjtcbiAgY29uc3Qgb2Zmc2V0WSA9IHZpZXdwb3J0Q2VudGVyLnkgLSBib3VuZHMuaGVpZ2h0IC8gMjtcblxuICAvLyBBcHBseSBvZmZzZXQgdG8gYWxsIGltcG9ydGVkIG5vZGVzXG4gIGZvciAoY29uc3QgZmlnSmFtTm9kZSBvZiBPYmplY3QudmFsdWVzKG5vZGVNYXApKSB7XG4gICAgaWYgKCd4JyBpbiBmaWdKYW1Ob2RlICYmICd5JyBpbiBmaWdKYW1Ob2RlKSB7XG4gICAgICBjb25zdCBsYXlvdXROb2RlID0gZmlnSmFtTm9kZSBhcyBMYXlvdXRNaXhpbjtcbiAgICAgIGxheW91dE5vZGUueCArPSBvZmZzZXRYO1xuICAgICAgbGF5b3V0Tm9kZS55ICs9IG9mZnNldFk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUGx1Z2luIGNsZWFudXBcbiAqL1xuZmlnbWEub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAvLyBDbGVhbnVwIGlmIG5lZWRlZFxufSk7XG5cbi8vIEV4cG9ydCBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IHsgaGFuZGxlQ2FudmFzSW1wb3J0IH07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=