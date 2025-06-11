import { CanvasParser } from './src/parser/canvasParser';

console.log('Testing import...');
const testData = CanvasParser.parseCanvasFile(
  '{"nodes":[],"edges":[]}'
);
console.log('Import successful:', testData);
