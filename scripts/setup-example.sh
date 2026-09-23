#!/bin/bash
#
# Sets up a Cordova example app with the background-geolocation plugin.
# Run from within an example directory (e.g. example/hello-world or example/ionic).
#
# Usage:  npm run setup
#
set -e

# CocoaPods normalises the installation path with String#unicode_normalize, which raises
# `Unicode Normalization not appropriate for ASCII-8BIT` on Ruby 3.4 when the environment
# carries no UTF-8 locale — and `cordova plugin add` shells out to `pod install`, so the whole
# install fails with a Ruby backtrace that names neither the locale nor this script.  Measured
# 2026-09-23: identical command, `LANG` unset -> fails, `LANG=en_US.UTF-8` -> installs both
# platforms.  An interactive terminal usually has one; a CI job, a cron, or an agent does not.
# `:-` so a caller who set a locale keeps it.
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

PLUGIN_ROOT="$(cd ../.. && pwd)"
EXAMPLE_DIR="$(pwd)"
PLUGIN_ID="cordova-background-geolocation-lt"

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

echo "▸ Removing any previously-installed plugin (forces a clean re-install of the packed build)..."
cordova plugin rm "$PLUGIN_ID" --nosave 2>/dev/null || true

echo "▸ Adding Cordova plugin..."
cordova plugin add "$TMPDIR/package"

echo "▸ Cleaning up..."
rm -rf "$TMPDIR"

# Cordova installs a plugin INTO a platform, so a platform that is missing takes the plugin with
# it — silently.  `plugin add` says nothing about a platform that is not there, and the app then
# builds and runs without the SDK, which looks like an SDK that does nothing rather than a plugin
# that was never installed.  Restore whatever package.json's `cordova.platforms` declares.
#
# AFTER the plugin is installed, deliberately.  `platform add` runs a plugin auto-restore, and
# cordova-lib skips a plugin only when `plugins/<id>` already exists (restore-util.js:227).  With
# an empty plugins/ it instead re-fetches from the `file:../..` spec and dies resolving the
# PROJECT's own package name — measured 2026-09-23 from a wiped tree.  Installing first also
# keeps auto-restore from fetching a PUBLISHED version over the packed build under test.
PLATFORMS=$(node -e "
  const pkg = require('./package.json');
  process.stdout.write(((pkg.cordova && pkg.cordova.platforms) || []).join(' '));
")
for platform in $PLATFORMS; do
  if [ ! -d "platforms/$platform" ]; then
    echo "▸ Restoring missing platform: $platform (installs the plugin into it)..."
    cordova platform add "$platform"
  fi
done


# Restore the file:../.. reference that cordova plugin add overwrites
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.devDependencies && pkg.devDependencies['$PLUGIN_ID']) {
    pkg.devDependencies['$PLUGIN_ID'] = 'file:../..';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  }
"

echo "▸ Re-linking plugin package..."
npm install "$PLUGIN_ID"

# `plugin add` runs `pod install` itself, but only when it decides the Podfile changed.  A
# Podfile.lock left over from an earlier native version outlives that check, so the app keeps
# linking the SDK it linked last time while the Podfile says otherwise — the failure that looks
# like a successful test.  Run it explicitly, and let it fail the script if it fails.
if [ -d "platforms/ios" ]; then
  echo "▸ Resolving iOS pods..."
  (cd platforms/ios && pod install)
fi

# What actually landed.  Every step above can succeed while installing something other than what
# you meant to test — a stale platform copy, a cached pod, a plugin added from the wrong path —
# and none of it is visible without looking.  So the run ends by naming the versions under test.
echo ""
echo "── Installed ─────────────────────────────────────────────"
INSTALLED_XML="plugins/$PLUGIN_ID/plugin.xml"
if [ -f "$INSTALLED_XML" ]; then
  # Skip the XML declaration: `<?xml version="1.0"?>` is the FIRST version= in the file, and
  # reporting it prints a confident, wrong number — which is the failure this summary exists to
  # prevent.  The plugin's own version lives on the <plugin> element.
  echo "   plugin              $(grep -v '<?xml' "$INSTALLED_XML" | sed -n 's/.*version="\([0-9][^"]*\)".*/\1/p' | head -1)"
else
  echo "   plugin              NOT INSTALLED ($INSTALLED_XML is missing)"
fi
if [ -f "platforms/ios/Podfile.lock" ]; then
  echo "   iOS TSLocationManager   $(sed -n 's/.*- TSLocationManager (\([^)]*\)).*/\1/p' platforms/ios/Podfile.lock | head -1)  (resolved)"
fi
ANDROID_GRADLE="platforms/android/$PLUGIN_ID/ionic-build.gradle"
[ -f "$ANDROID_GRADLE" ] || ANDROID_GRADLE="platforms/android/$PLUGIN_ID/$PLUGIN_ID.gradle"
if [ -f "$ANDROID_GRADLE" ]; then
  echo "   Android tslocationmanager  $(sed -n 's/.*DEFAULT_TSLOCATIONMANAGER_VERSION *= *"\([^"]*\)".*/\1/p' "$ANDROID_GRADLE" | head -1)  (pin; Gradle resolves it at build time)"
fi
echo "──────────────────────────────────────────────────────────"
echo "✔ Setup complete."
