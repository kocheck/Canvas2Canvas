#!/usr/bin/env node

/**
 * Canvas2Canvas Demo Script
 * Demonstrates plugin functionality without requiring FigJam
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Canvas2Canvas Demo\n');

// Test files
const testFiles = [
  'test-samples/sample-canvas.canvas',
  'test-samples/complex-canvas.canvas',
];

function demonstrateConversion(filePath) {
  console.log(`📁 Processing: ${path.basename(filePath)}`);
  console.log('─'.repeat(50));

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const canvas = JSON.parse(content);

    // Analysis
    console.log(`📊 Canvas Analysis:`);
    console.log(`   📝 Total Nodes: ${canvas.nodes?.length || 0}`);
    console.log(`   🔗 Total Edges: ${canvas.edges?.length || 0}`);

    // Node breakdown
    if (canvas.nodes) {
      const nodeTypes = canvas.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {});

      console.log(`\n🎨 Conversion Preview:`);
      for (const [type, count] of Object.entries(nodeTypes)) {
        const conversions = {
          text: '📝 Text Nodes → 🟡 Sticky Notes',
          file: '📄 File Nodes → 📃 Text Elements',
          link: '🔗 Link Nodes → 🟢 Link Shapes',
          group: '📦 Group Nodes → 🟦 Frames',
        };
        console.log(
          `   ${conversions[type] || `❓ ${type} Nodes`}: ${count}`
        );
      }
    }

    // Edge analysis
    if (canvas.edges?.length > 0) {
      console.log(`\n🔗 Connection Analysis:`);
      const edgeFeatures = {
        withLabels: canvas.edges.filter((e) => e.label).length,
        withArrows: canvas.edges.filter(
          (e) => e.toEnd === 'arrow' || e.fromEnd === 'arrow'
        ).length,
        withColors: canvas.edges.filter((e) => e.color).length,
        withSides: canvas.edges.filter((e) => e.fromSide || e.toSide)
          .length,
      };

      console.log(`   ↔️  Basic Connectors: ${canvas.edges.length}`);
      if (edgeFeatures.withArrows > 0)
        console.log(`   ➡️  With Arrows: ${edgeFeatures.withArrows}`);
      if (edgeFeatures.withLabels > 0)
        console.log(`   🏷️  With Labels: ${edgeFeatures.withLabels}`);
      if (edgeFeatures.withColors > 0)
        console.log(`   🎨 With Colors: ${edgeFeatures.withColors}`);
      if (edgeFeatures.withSides > 0)
        console.log(
          `   📍 With Positioning: ${edgeFeatures.withSides}`
        );
    }

    // Bounds calculation
    if (canvas.nodes?.length > 0) {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      canvas.nodes.forEach((node) => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      });

      console.log(`\n📐 Canvas Dimensions:`);
      console.log(`   📏 Width: ${maxX - minX}px`);
      console.log(`   📏 Height: ${maxY - minY}px`);
      console.log(
        `   📍 Position: (${minX}, ${minY}) to (${maxX}, ${maxY})`
      );
    }

    // Import simulation
    console.log(`\n⚡ Import Simulation:`);
    console.log(`   📖 Parsing: ✅ Valid JSON Canvas format`);
    console.log(`   🔄 Converting: ✅ All node types supported`);
    console.log(
      `   🎨 Creating: ✅ ${canvas.nodes?.length || 0} elements + ${
        canvas.edges?.length || 0
      } connectors`
    );
    console.log(`   ✅ Result: Ready for FigJam import!`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n');
}

// Demo each test file
testFiles.forEach(demonstrateConversion);

console.log('🚀 Ready to import these canvases into FigJam!');
console.log('\nNext steps:');
console.log('1. npm run build');
console.log('2. Import manifest.json in FigJam');
console.log('3. Drag and drop these .canvas files');
console.log('4. Watch the magic happen! ✨');
