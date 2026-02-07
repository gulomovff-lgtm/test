#!/bin/bash
# Assembly script for App.jsx parts

echo "🔨 Assembling App.jsx from 5 parts..."

# Check if all parts exist
for i in 1 2 3 4 5; do
  if [ ! -f "App_Part${i}.jsx" ]; then
    echo "❌ Error: App_Part${i}.jsx not found!"
    exit 1
  fi
done

# Assemble the parts
cat App_Part1.jsx App_Part2.jsx App_Part3.jsx App_Part4.jsx App_Part5.jsx > App.jsx

# Verify assembly
if [ -f "App.jsx" ]; then
  LINES=$(wc -l < App.jsx)
  SIZE=$(du -h App.jsx | cut -f1)
  
  echo "✅ Assembly complete!"
  echo "📄 Output: App.jsx"
  echo "📊 Total lines: $LINES"
  echo "💾 File size: $SIZE"
  echo ""
  echo "✨ Your assembled App.jsx is ready to use!"
else
  echo "❌ Assembly failed!"
  exit 1
fi
