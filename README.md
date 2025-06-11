# Canvas2Canvas

Obsidian Canvas Importer for FigJam

## Overview

Canvas2Canvas is a FigJam plugin that imports Obsidian Canvas files (.canvas) and converts them into native FigJam elements. The plugin preserves spatial relationships, node types, and connections while providing a seamless import experience.

## Features

### Supported Canvas Elements
- **📝 Text Nodes** → FigJam Sticky Notes
- **📄 File Nodes** → Text Elements with file references
- **🔗 Link Nodes** → Shapes with URL indicators
- **📦 Group Nodes** → FigJam Frames
- **↔️ Edges** → FigJam Connectors with proper endpoints

### Import Capabilities
- ✅ Preserves spatial positioning and relationships
- ✅ Maintains original colors and styling where possible
- ✅ Handles complex canvas structures with nested elements
- ✅ Provides real-time import progress feedback
- ✅ Graceful error handling and validation
- ✅ Supports files up to 10MB

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Load the plugin in FigJam:
   - Open FigJam
   - Go to Plugins → Development → Import plugin from manifest...
   - Select the `manifest.json` file from this project

## Usage

### Exporting from Obsidian
1. Open your canvas in Obsidian
2. Right-click in the canvas area
3. Select "Export Canvas" or save the `.canvas` file directly

### Importing to FigJam
1. Open FigJam and create a new file
2. Open the Canvas2Canvas plugin from the plugins menu
3. Either:
   - Drag and drop your `.canvas` file into the plugin interface
   - Click "Choose File" and select your `.canvas` file
4. Monitor the import progress
5. Review the imported content in your FigJam canvas

## Development

### Project Structure
```
src/
├── main.ts                 # Main plugin thread
├── ui.tsx                  # UI entry point
├── ui.html                 # HTML template
├── parser/
│   ├── canvasParser.ts     # JSON Canvas parser
│   └── typeDefinitions.ts  # Type definitions
├── converters/
│   ├── nodeConverter.ts    # Canvas node → FigJam element converter
│   └── edgeConverter.ts    # Canvas edge → FigJam connector converter
└── ui/
    ├── App.tsx            # Main React component
    └── App.css            # Plugin UI styles
```

### Available Scripts
- `npm run build` - Build production version
- `npm run dev` - Build development version with watch mode
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode

### Testing
The project includes comprehensive tests for the core parsing functionality:

```bash
npm test
```

Test files are located in the `tests/` directory and cover:
- Canvas file parsing and validation
- Node type conversions
- Edge relationship handling
- Error conditions and edge cases

## Canvas Format Support

### Node Types
| Canvas Type | FigJam Element | Notes |
|-------------|----------------|-------|
| `text` | Sticky Note | Preserves text content and color |
| `file` | Text Element | Shows file name and path reference |
| `link` | Rectangle + Text | Displays domain/URL with link styling |
| `group` | Frame | Maintains grouping with optional labels |

### Edge Properties
- **Connection Points**: `fromSide`/`toSide` mapped to FigJam magnets
- **Arrow Ends**: `fromEnd`/`toEnd` converted to stroke caps
- **Labels**: Edge labels positioned along connectors
- **Colors**: Custom edge colors preserved

### Example Canvas File
```json
{
  "nodes": [
    {
      "id": "node1",
      "type": "text",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "text": "Main Idea",
      "color": "#FFEB3B"
    },
    {
      "id": "node2",
      "type": "file",
      "x": 400,
      "y": 100,
      "width": 180,
      "height": 80,
      "file": "notes/research.md"
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "fromNode": "node1",
      "toNode": "node2",
      "fromSide": "right",
      "toSide": "left",
      "toEnd": "arrow"
    }
  ]
}
```

## Error Handling

The plugin provides comprehensive error handling:

- **Invalid JSON**: Clear error messages for malformed files
- **Missing Properties**: Validation of required node/edge properties
- **Type Validation**: Ensures proper node types and structure
- **Large Files**: File size limits with user feedback
- **Missing References**: Graceful handling of broken edge references

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Submit a pull request

### Development Guidelines
- Add tests for new features
- Follow TypeScript best practices
- Update documentation for API changes
- Test with various Canvas file types

## Troubleshooting

### Common Issues

**Plugin won't load in FigJam**
- Ensure you're using FigJam (not Figma)
- Check that manifest.json is properly configured
- Verify the plugin build completed successfully

**Import fails with large files**
- Check file size (10MB limit)
- Validate JSON structure
- Try importing a smaller test file first

**Missing connections after import**
- Verify edge references match node IDs
- Check that both source and target nodes exist
- Review the import summary for warnings

**Positioning issues**
- Canvas coordinates are preserved but may need adjustment
- Use FigJam's zoom to fit functionality after import
- Check original canvas bounds vs FigJam viewport

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Support for additional Canvas node types
- [ ] Advanced styling preservation
- [ ] Batch import of multiple canvas files
- [ ] Export from FigJam back to Canvas format
- [ ] Integration with Obsidian plugin API
- [ ] Custom import settings and preferences
