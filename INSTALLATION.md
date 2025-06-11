# Canvas2Canvas Installation Guide

## 🚀 Quick Start

Canvas2Canvas is now ready to install and use! Follow these steps to get the plugin working in FigJam.

## Prerequisites

- **FigJam Account** (not regular Figma)
- **Node.js 16+** for building the plugin
- **Canvas files** from Obsidian to import

## Installation Steps

### 1. Build the Plugin

```bash
# Clone or download this repository
cd Canvas2Canvas

# Install dependencies (if not already done)
npm install

# Build the plugin
npm run build
```

You should see output like:
```
> canvas2canvas@1.0.0 build
> webpack --config webpack.dev.config.js

3 assets
32 modules
webpack 5.99.9 compiled successfully in 560 ms
```

### 2. Verify Build Output

Check that these files were created:
```bash
ls -la dist/
# Should show:
# main.js    - Plugin main thread code
# ui.js      - Plugin UI code
# ui.html    - Plugin interface
```

### 3. Install in FigJam

1. **Open FigJam** (not regular Figma!)
2. Create a new FigJam file or open an existing one
3. Go to **Menu** → **Plugins** → **Development**
4. Click **"Import plugin from manifest..."**
5. Navigate to your Canvas2Canvas folder
6. Select `manifest.json`
7. Click **"Open"**

### 4. Verify Installation

The plugin should now appear in your plugins list:
- **Menu** → **Plugins** → **"Canvas2Canvas"**

## 🧪 Testing the Plugin

### Test with Sample Files

Use the provided sample files to test:

```bash
# Validate sample files first
npm run validate test-samples/sample-canvas.canvas
npm run validate test-samples/complex-canvas.canvas
```

Both should show "✅ Canvas file is valid!"

### Import Test

1. **Open the plugin** in FigJam
2. **Drag and drop** `test-samples/sample-canvas.canvas`
3. **Watch the import process**:
   - 📖 Parsing canvas file...
   - 🔄 Converting nodes to FigJam elements...
   - 🎨 Creating connectors...
   - ✅ Import complete!

Expected results:
- **4 sticky notes** (text nodes)
- **1 text element** (file reference)
- **1 link shape** (web link)
- **1 frame** (group)
- **6 connectors** (edges)

## 🔧 Troubleshooting

### Plugin Won't Load

**Error**: "Plugin failed to load"
**Solution**:
- Make sure you're in **FigJam** (not Figma)
- Check that `dist/` folder exists with built files
- Try rebuilding: `npm run build`

### Build Fails

**Error**: Webpack compilation errors
**Solution**:
- Check Node.js version: `node --version` (need 16+)
- Clean install: `rm -rf node_modules && npm install`
- Try: `npm run test` to verify core functionality

### Import Fails

**Error**: "Import failed" message in plugin
**Solution**:
- Validate your canvas file: `npm run validate your-file.canvas`
- Try with sample file first
- Check file size (must be < 10MB)
- Ensure valid JSON format

### No Elements Created

**Error**: Plugin completes but nothing appears
**Solution**:
- Use **"Zoom to Fit"** in FigJam to see imported content
- Check the import summary for warnings
- Try with a simpler canvas file first

## 📁 File Format

### Valid Canvas File Structure

```json
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "text",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "text": "Your content here"
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "fromNode": "unique-id",
      "toNode": "another-id",
      "toEnd": "arrow"
    }
  ]
}
```

### Supported Node Types

| Type | Required Properties | Example |
|------|-------------------|---------|
| `text` | `text` | Notes, ideas |
| `file` | `file` | Document references |
| `link` | `url` | Web links |
| `group` | `label` (optional) | Organizing content |

## 🔄 Development Workflow

### Making Changes

1. **Edit source files** in `src/`
2. **Rebuild**: `npm run build`
3. **Reload plugin** in FigJam:
   - Menu → Plugins → Development → Reload
4. **Test changes** with sample files

### Adding Features

1. **Add tests** in `tests/`
2. **Run tests**: `npm test`
3. **Update types** in `src/parser/typeDefinitions.ts`
4. **Update converters** in `src/converters/`

### Debug Mode

For development, use watch mode:
```bash
npm run dev
```

This rebuilds automatically when you save files.

## 📊 Performance

### Recommended Limits

- **File size**: < 10MB
- **Node count**: < 1000 nodes
- **Edge count**: < 500 edges

### Large Files

For complex canvases:
1. **Split into sections** in Obsidian
2. **Import separately** to FigJam
3. **Combine manually** if needed

## 🎯 Next Steps

Once installed and working:

1. **Import your real canvases** from Obsidian
2. **Collaborate** using FigJam's real-time features
3. **Present** using FigJam's presentation mode
4. **Export** or share your enhanced diagrams

## 🆘 Support

### Self-Help

1. **Run tests**: `npm test` (should show 11 passing)
2. **Validate files**: `npm run validate your-file.canvas`
3. **Check logs**: Browser dev tools in FigJam
4. **Try samples**: Use provided test files first

### Common Issues

- **"Module not found"**: Run `npm install`
- **"Build failed"**: Check Node.js version
- **"Invalid canvas"**: Validate JSON structure
- **"Plugin not found"**: Import manifest.json, not the folder

The plugin is ready to use! 🎉
