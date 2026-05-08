#!/bin/bash
#
# Sets up a Cordova example app with the background-geolocation plugin.
# Run from within an example directory (e.g. example/hello-world or example/ionic).
#
# Usage:  npm run setup
#
set -e

PLUGIN_ROOT="$(cd ../.. && pwd)"
EXAMPLE_DIR="$(pwd)"

echo "▸ Installing npm dependencies..."
npm install

echo "▸ Packing plugin (excludes example/ via .npmignore)..."
cd "$PLUGIN_ROOT"
TARBALL_NAME=$(npm pack --pack-destination "$EXAMPLE_DIR" 2>/dev/null | tail -1)
cd "$EXAMPLE_DIR"

TARBALL="$EXAMPLE_DIR/$TARBALL_NAME"

echo "▸ Extracting to temp directory..."
TMPDIR=$(mktemp -d)
tar xzf "$TARBALL" -C "$TMPDIR"
rm -f "$TARBALL"

echo "▸ Adding Cordova plugin..."
cordova plugin add "$TMPDIR/package"

echo "▸ Cleaning up..."
rm -rf "$TMPDIR"

# Restore the file:../.. reference that cordova plugin add overwrites
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.devDependencies && pkg.devDependencies['cordova-background-geolocation-lt']) {
    pkg.devDependencies['cordova-background-geolocation-lt'] = 'file:../..';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  }
"

echo "▸ Re-linking plugin package..."
npm install cordova-background-geolocation-lt

echo "✔ Setup complete."
