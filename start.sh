#!/bin/bash

# Weaviate Dashboard Startup Script

echo "🚀 Starting Weaviate Dashboard..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Check if requirements are installed
if ! python3 -c "import flask" &> /dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Check if Weaviate is accessible
echo "🔍 Checking Weaviate connection..."
WEAVIATE_URL=$(python3 -c "import config; print(config.WEAVIATE_URL)")

if curl -s --connect-timeout 5 "$WEAVIATE_URL/v1/meta" > /dev/null; then
    echo "✅ Weaviate is accessible at $WEAVIATE_URL"
else
    echo "⚠️  Warning: Cannot connect to Weaviate at $WEAVIATE_URL"
    echo "   Please ensure Weaviate is running and check your config.py settings"
fi

echo ""
echo "🌐 Starting dashboard server..."
echo "   Dashboard will be available at: http://localhost:5000"
echo "   Press Ctrl+C to stop the server"
echo ""

python3 app.py
