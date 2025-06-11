# Canvas2Canvas User Guide

## What is Canvas2Canvas?

Canvas2Canvas is a FigJam plugin that lets you import Obsidian Canvas files directly into FigJam, preserving your visual structure and connections.

## Getting Started

### Step 1: Export from Obsidian
1. Open your canvas in Obsidian
2. Your canvas file is automatically saved as `filename.canvas`
3. Locate the file in your vault folder

### Step 2: Import to FigJam
1. Open FigJam and create a new board
2. Go to **Plugins** → Find "Canvas2Canvas"
3. Drag your `.canvas` file into the plugin window
4. Wait for the import to complete
5. Your canvas content appears in FigJam!

## What Gets Imported

| Obsidian Canvas Element | FigJam Result | Example |
|------------------------|---------------|---------|
| 📝 **Text Card** | Sticky Note | Notes, ideas, thoughts |
| 📄 **File Reference** | Text Box | Links to documents, images |
| 🔗 **Web Link** | Shape with URL | External resources, websites |
| 📦 **Group** | Frame | Organizing related content |
| ↔️ **Connection** | Connector | Arrows between elements |

## Visual Examples

### Before (Obsidian Canvas)
```
[Text: "Project Ideas"] ──→ [File: project-plan.md]
         │
         ↓
[Group: "Tasks"]
├── [Text: "Research"]
└── [Text: "Design"]
```

### After (FigJam)
```
[Sticky: "Project Ideas"] ──→ [Text: "📄 project-plan.md"]
         │
         ↓
[Frame: "Tasks"]
├── [Sticky: "Research"]
└── [Sticky: "Design"]
```

## Import Process

The import happens in stages:

1. **📖 Parsing** - Reading your canvas file
2. **🔄 Converting** - Transforming elements to FigJam
3. **🎨 Creating** - Building elements in FigJam
4. **✅ Complete** - Ready to use!

You'll see a progress bar with real-time updates.

## Supported Features

### ✅ What Works Great
- Text content and basic formatting
- Spatial positioning (where things are placed)
- Connections between elements
- Groups and organization
- File references and web links
- Color preservation

### ⚠️ Limitations
- Complex text formatting may be simplified
- Some Canvas-specific features won't transfer
- Very large files (>10MB) may have issues
- Custom Canvas plugins won't be imported

## Troubleshooting

### "Import Failed" Error
**Problem**: Plugin shows an error message
**Solutions**:
- Check that your file is a valid `.canvas` file
- Try with a smaller, simpler canvas first
- Make sure the file isn't corrupted

### Missing Elements
**Problem**: Some items didn't import
**Solutions**:
- Check the import summary for warnings
- Verify your original canvas doesn't have broken references
- Try re-exporting from Obsidian

### Wrong Positioning
**Problem**: Elements appear in wrong places
**Solutions**:
- Use FigJam's "Zoom to Fit" to see all content
- Elements maintain relative positions
- You can manually adjust after import

### File Too Large
**Problem**: "File size too large" warning
**Solutions**:
- Current limit is 10MB
- Try splitting complex canvases into smaller sections
- Remove unused elements before export

## Tips for Best Results

### Before Exporting from Obsidian
1. **Clean up your canvas** - Remove unused elements
2. **Check connections** - Make sure arrows point to valid elements
3. **Use simple formatting** - Complex styling may not transfer
4. **Group related items** - Use Canvas groups for organization

### After Importing to FigJam
1. **Zoom to fit** - See your entire imported canvas
2. **Review connections** - Check that arrows point correctly
3. **Adjust styling** - Fine-tune colors and formatting
4. **Add FigJam features** - Use cursors, voting, etc.

## Common Workflows

### 🧠 Brainstorming Sessions
- Export your Obsidian mind map
- Import to FigJam for team collaboration
- Add real-time cursors and voting

### 📋 Project Planning
- Start planning in Obsidian Canvas
- Import to FigJam for team review
- Use FigJam's presentation mode

### 🔗 Knowledge Mapping
- Build connections in Obsidian
- Import to FigJam for visual sharing
- Add comments and feedback

## File Format Details

Canvas files are JSON with this structure:
```json
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "text|file|link|group",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "text": "Content here"
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "fromNode": "source-id",
      "toNode": "target-id"
    }
  ]
}
```

## Need Help?

- **File Issues**: Check the Canvas format is correct
- **Plugin Issues**: Try refreshing FigJam and reloading the plugin
- **Feature Requests**: The plugin is actively developed

Remember: Canvas2Canvas makes it easy to move from individual knowledge work in Obsidian to collaborative visual work in FigJam! 🚀
