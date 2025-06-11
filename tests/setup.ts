// Test setup file
/// <reference types="@figma/plugin-typings" />

(global as any).figma = {
  createSticky: jest.fn(),
  createText: jest.fn(),
  createRectangle: jest.fn(),
  createFrame: jest.fn(),
  createConnector: jest.fn(),
  createGroup: jest.fn(),
  group: jest.fn(),
  loadFontAsync: jest.fn().mockResolvedValue(undefined),
  getNodeById: jest.fn(),
  currentPage: {
    appendChild: jest.fn(),
  },
  viewport: {
    center: { x: 0, y: 0 },
    scrollAndZoomIntoView: jest.fn(),
  },
  showUI: jest.fn(),
  closePlugin: jest.fn(),
  ui: {
    postMessage: jest.fn(),
    onmessage: null,
  },
  on: jest.fn(),
} as any;
