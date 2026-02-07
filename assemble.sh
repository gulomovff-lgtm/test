#!/bin/bash

# Assembly script for App.jsx
# Combines all 5 parts into a single file

echo "🔧 Assembling App.jsx from parts..."

# Create or overwrite App.jsx
cat App_Part1.jsx > App.jsx
cat App_Part2.jsx >> App.jsx
cat App_Part3.jsx >> App.jsx
cat App_Part4.jsx >> App.jsx
cat App_Part5.jsx >> App.jsx

echo "✅ App.jsx successfully assembled!"
echo ""
echo "File statistics:"
wc -l App_Part*.jsx App.jsx
echo ""
echo "📁 Output file: App.jsx"
echo "📋 To use: Copy App.jsx to your React src folder"
