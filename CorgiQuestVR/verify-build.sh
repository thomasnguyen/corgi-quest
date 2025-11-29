#!/bin/bash

# Build Verification Script for Task 7 Integration
# Run this script when you have access to Xcode to verify the build

echo "🔍 Verifying VR Advanced Features Integration..."
echo ""

# Check if we're in the right directory
if [ ! -d "CorgiQuestVR.xcodeproj" ]; then
    echo "❌ Error: Must be run from CorgiQuestVR directory"
    exit 1
fi

echo "✅ Found Xcode project"
echo ""

# Check if new files exist
echo "📁 Checking new files..."
FILES=(
    "CorgiQuestVR/Services/AppConfiguration.swift"
    "CorgiQuestVR/Views/SettingsView.swift"
    "CorgiQuestVR/Views/PerformanceOverlay.swift"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
        exit 1
    fi
done

echo ""
echo "📝 Checking modified files..."
MODIFIED_FILES=(
    "CorgiQuestVR/Views/TrainingRoomView.swift"
    "CorgiQuestVR/ViewModels/TrainingRoomViewModel.swift"
)

for file in "${MODIFIED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
        exit 1
    fi
done

echo ""
echo "🔨 Building project..."
echo ""

# Build the project
xcodebuild -project CorgiQuestVR.xcodeproj \
    -scheme CorgiQuestVR \
    -destination 'platform=visionOS Simulator,name=Apple Vision Pro' \
    clean build \
    | grep -E '(error|warning|succeeded|failed)' \
    | grep -v 'note:'

BUILD_RESULT=${PIPESTATUS[0]}

echo ""
if [ $BUILD_RESULT -eq 0 ]; then
    echo "✅ Build succeeded!"
    echo ""
    echo "🎉 Task 7 Integration verified successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Run the app in Vision Pro simulator"
    echo "  2. Test feature toggles in Settings"
    echo "  3. Verify graceful degradation by simulating errors"
    echo "  4. Test accessibility options"
    echo "  5. Check performance overlay"
else
    echo "❌ Build failed"
    echo ""
    echo "Please check the errors above and fix them."
    exit 1
fi
