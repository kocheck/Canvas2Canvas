#!/usr/bin/env node

/**
 * Simple test script to validate Canvas files
 * Usage: node validate-canvas.js path/to/file.canvas
 */

const fs = require('fs');
const path = require('path');

// Simple parser test without webpack compilation
function validateCanvas(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    console.log('📊 Canvas Analysis:');
    console.log(`  📄 File: ${path.basename(filePath)}`);
    console.log(`  📝 Nodes: ${data.nodes?.length || 0}`);
    console.log(`  🔗 Edges: ${data.edges?.length || 0}`);

    if (data.nodes) {
      const nodeTypes = data.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {});

      console.log('  📋 Node Types:');
      for (const [type, count] of Object.entries(nodeTypes)) {
        const icon =
          { text: '📝', file: '📄', link: '🔗', group: '📦' }[type] ||
          '❓';
        console.log(`    ${icon} ${type}: ${count}`);
      }
    }

    // Basic validation
    const issues = [];

    if (!data.nodes) issues.push('Missing nodes array');
    if (!data.edges) issues.push('Missing edges array');

    if (data.nodes) {
      data.nodes.forEach((node, i) => {
        if (!node.id) issues.push(`Node ${i}: missing id`);
        if (!node.type) issues.push(`Node ${i}: missing type`);
        if (typeof node.x !== 'number')
          issues.push(`Node ${i}: invalid x coordinate`);
        if (typeof node.y !== 'number')
          issues.push(`Node ${i}: invalid y coordinate`);
        if (typeof node.width !== 'number')
          issues.push(`Node ${i}: invalid width`);
        if (typeof node.height !== 'number')
          issues.push(`Node ${i}: invalid height`);
      });
    }

    if (data.edges) {
      data.edges.forEach((edge, i) => {
        if (!edge.id) issues.push(`Edge ${i}: missing id`);
        if (!edge.fromNode)
          issues.push(`Edge ${i}: missing fromNode`);
        if (!edge.toNode) issues.push(`Edge ${i}: missing toNode`);
      });
    }

    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach((issue) => console.log(`  • ${issue}`));
      return false;
    }

    console.log('\n✅ Canvas file is valid!');
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// CLI usage
if (require.main === module) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log('Usage: node validate-canvas.js <canvas-file>');
    console.log('\nExample:');
    console.log(
      '  node validate-canvas.js test-samples/sample-canvas.canvas'
    );
    process.exit(1);
  }

  const isValid = validateCanvas(filePath);
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateCanvas };
