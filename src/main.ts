/// <reference types="@figma/plugin-typings" />

import { CanvasParser } from './parser/canvasParser';
import { NodeConverter } from './converters/nodeConverter';
import { EdgeConverter } from './converters/edgeConverter';
import {
  CanvasData,
  ImportProgress,
  ConversionResult,
  FigJamNodeMap,
} from './parser/typeDefinitions';

// Plugin main thread - handles the actual FigJam API calls
figma.showUI(__html__, {
  width: 320,
  height: 400,
  themeColors: true,
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
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred',
    });
  }
};

/**
 * Handle the canvas import process
 */
async function handleCanvasImport(
  fileContent: string
): Promise<void> {
  let canvasData: CanvasData;

  // Send progress update
  const sendProgress = (progress: ImportProgress) => {
    figma.ui.postMessage({
      type: 'progress',
      progress,
    });
  };

  try {
    // Stage 1: Parse the canvas file
    sendProgress({
      stage: 'parsing',
      progress: 10,
      message: 'Parsing canvas file...',
    });

    canvasData = CanvasParser.parseCanvasFile(fileContent);

    sendProgress({
      stage: 'parsing',
      progress: 25,
      message: `Found ${canvasData.nodes.length} nodes and ${canvasData.edges.length} edges`,
    });

    // Stage 2: Convert nodes to FigJam elements
    sendProgress({
      stage: 'converting',
      progress: 30,
      message: 'Converting nodes to FigJam elements...',
    });

    const nodeMap: FigJamNodeMap = {};
    const conversionResults: ConversionResult = {
      success: true,
      nodesCreated: 0,
      edgesCreated: 0,
      errors: [],
      warnings: [],
    };

    // Convert nodes
    for (let i = 0; i < canvasData.nodes.length; i++) {
      const node = canvasData.nodes[i];

      try {
        const figJamNode = await NodeConverter.convertNode(
          node,
          nodeMap
        );
        if (figJamNode) {
          nodeMap[node.id] = figJamNode;
          conversionResults.nodesCreated++;
        } else {
          conversionResults.warnings.push(
            `Failed to convert node: ${node.id}`
          );
        }
      } catch (error) {
        const errorMsg = `Error converting node ${node.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        conversionResults.errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Update progress
      const progress = 30 + (i / canvasData.nodes.length) * 40;
      sendProgress({
        stage: 'converting',
        progress,
        message: `Converting node ${i + 1} of ${
          canvasData.nodes.length
        }...`,
      });
    }

    // Stage 3: Create connectors for edges
    sendProgress({
      stage: 'creating',
      progress: 70,
      message: 'Creating connectors...',
    });

    // Validate edge references
    const edgeValidation = EdgeConverter.validateEdgeReferences(
      canvasData.edges,
      nodeMap
    );

    for (const invalidEdge of edgeValidation.invalid) {
      conversionResults.warnings.push(
        `Invalid edge: ${invalidEdge.reason}`
      );
    }

    // Convert valid edges
    const connectors = await EdgeConverter.convertEdges(
      edgeValidation.valid,
      nodeMap,
      (current, total) => {
        const progress = 70 + (current / total) * 20;
        sendProgress({
          stage: 'creating',
          progress,
          message: `Creating connector ${current} of ${total}...`,
        });
      }
    );

    conversionResults.edgesCreated = connectors.length;

    // Stage 4: Finalize and position content
    sendProgress({
      stage: 'creating',
      progress: 90,
      message: 'Positioning content...',
    });

    await positionImportedContent(canvasData, nodeMap);

    // Stage 5: Complete
    sendProgress({
      stage: 'complete',
      progress: 100,
      message: `Import complete! Created ${conversionResults.nodesCreated} nodes and ${conversionResults.edgesCreated} connectors.`,
    });

    // Send final results
    figma.ui.postMessage({
      type: 'import-complete',
      result: conversionResults,
    });

    // Focus on the imported content
    if (Object.keys(nodeMap).length > 0) {
      const nodes = Object.values(nodeMap);
      figma.viewport.scrollAndZoomIntoView(nodes);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred during import';

    sendProgress({
      stage: 'error',
      progress: 0,
      error: errorMessage,
    });

    figma.ui.postMessage({
      type: 'error',
      message: errorMessage,
    });
  }
}

/**
 * Position the imported content appropriately in the FigJam canvas
 */
async function positionImportedContent(
  canvasData: CanvasData,
  nodeMap: FigJamNodeMap
): Promise<void> {
  if (Object.keys(nodeMap).length === 0) return;

  // Get current viewport center
  const viewport = figma.viewport;
  const viewportCenter = {
    x: viewport.center.x,
    y: viewport.center.y,
  };

  // Get canvas bounds
  const bounds = CanvasParser.getCanvasBounds(canvasData);

  // Calculate offset to center the imported content in viewport
  const offsetX = viewportCenter.x - bounds.width / 2;
  const offsetY = viewportCenter.y - bounds.height / 2;

  // Apply offset to all imported nodes
  for (const figJamNode of Object.values(nodeMap)) {
    if ('x' in figJamNode && 'y' in figJamNode) {
      const layoutNode = figJamNode as LayoutMixin;
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
export { handleCanvasImport };
