#!/usr/bin/env bash
# Everything worth checking before a release — run by scripts/release.sh and by the
# release workflow, and safe to run any time.
#
#   scripts/preflight.sh             tests, pack, and compile a consumer against the tarball
#   scripts/preflight.sh --release   also: CHANGELOG has a heading for this version
#
# There is no build: what `npm test` exercises is what ships. What the tests cannot see is
# the tarball, shaped by .npmignore alone (5.4.0 shipped .github/ and a local build's
# src/android/.gradle/ caches), and plugin.xml's own
# version, which Cordova reads and package.json does not set. Builds nothing it keeps,
# publishes nothing; it reads the registry only to compare file lists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
RELEASE=0
[ "${1:-}" = "--release" ] && RELEASE=1

GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; DIM=$'\033[2m'; RESET=$'\033[0m'
ok()   { echo "  ${GREEN}✓${RESET} $1"; }
fail() { echo "  ${RED}✗${RESET} $1" >&2; exit 1; }
step() { echo; echo "${DIM}── $1${RESET}"; }

cd "$ROOT"
NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"

step "1. version"
echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$' || fail "package.json version '$VERSION' is not semver"
# The <plugin> element's version (not the <?xml version="1.0"?> declaration above it).
PLUGIN_XML="$(tr '\n' ' ' < plugin.xml | grep -o '<plugin[^>]*>' | grep -o 'version="[^"]*"' | cut -d'"' -f2)"
[ "$PLUGIN_XML" = "$VERSION" ] || fail "plugin.xml says $PLUGIN_XML, package.json says $VERSION"
if [ "$RELEASE" = 1 ]; then
  # The first `## ` heading must be this version: an `## Unreleased` above it means the
  # notes were never given a version.
  first="$(grep -m1 '^## ' CHANGELOG.md || true)"
  case "$first" in
    "## $VERSION "*) ok "$NAME@$VERSION, plugin.xml $PLUGIN_XML — CHANGELOG: $first" ;;
    *) fail "CHANGELOG's first heading is '$first', not '## $VERSION …' — run npm run release -- prepare" ;;
  esac
else
  ok "$NAME@$VERSION, plugin.xml $PLUGIN_XML"
fi

step "2. tests"
npm test >"$WORK/test.log" 2>&1 || { cat "$WORK/test.log" >&2; fail "npm test"; }
ok "npm test — $(grep -cE '^\s*ok\b' "$WORK/test.log" || true) passed"

step "3. the tarball"
npm pack --silent --pack-destination "$WORK" >/dev/null || fail "npm pack"
TARBALL="$(ls "$WORK"/*.tgz)"
tar -tzf "$TARBALL" | sort > "$WORK/contents"
# What Cordova and an Ionic import need: plugin.xml, the www/ modules it clobbers, the npm
# entry and typings, and the native sources for both platforms.
for want in package/package.json package/plugin.xml package/src/index.js package/src/index.d.ts \
            package/www/BackgroundGeolocation.js package/www/Enums.js; do
  grep -qx "$want" "$WORK/contents" || fail "the tarball has no $want"
done
grep -q '^package/src/android/' "$WORK/contents" || fail "the tarball has no src/android/"
grep -q '^package/src/ios/' "$WORK/contents" || fail "the tarball has no src/ios/"
bad="$(grep -E '^package/(\.github|scripts|test|example|docs|help|bin|node_modules|src/ionic)/|/\.gradle/|^package/RELEASING\.md$' "$WORK/contents" || true)"
[ -z "$bad" ] || fail "the tarball carries what it should not (.npmignore): $(echo "$bad" | head -3 | tr '\n' ' ')"
ok "$(basename "$TARBALL") — $(wc -l < "$WORK/contents" | tr -d ' ') files"
# Against the version on npm now: files that vanish or appear are worth a look before
# they ship. Printed, not enforced — a deliberate change is fine.
PREV="$(npm view "$NAME" dist-tags.latest 2>/dev/null || true)"
if [ -n "$PREV" ] && (cd "$WORK" && npm pack --silent "$NAME@$PREV" >/dev/null 2>&1); then
  tar -tzf "$WORK"/*-"$PREV".tgz | sort > "$WORK/previous"
  gone="$(comm -23 "$WORK/previous" "$WORK/contents" | sed 's#^package/##')"
  new="$(comm -13 "$WORK/previous" "$WORK/contents" | sed 's#^package/##')"
  ok "against $PREV on npm: $(echo -n "$gone" | grep -c . || true) gone, $(echo -n "$new" | grep -c . || true) new"
  [ -z "$gone" ] || echo "$gone" | head -10 | sed 's/^/      - /'
  [ -z "$new" ] || echo "$new" | head -10 | sed 's/^/      + /'
else
  echo "  ${DIM}(no published version to compare with)${RESET}"
fi

step "4. a consumer compiles against it"
# The Ionic/Angular import path. The package has no TypeScript of its own, so the consumer
# brings one; the types package comes in as a dependency. src/index.js is a lazy bridge to
# window.BackgroundGeolocation, so the runtime shape is npm test's to check, not this one's.
mkdir -p "$WORK/consumer" && cd "$WORK/consumer"
echo '{"name": "consumer", "private": true}' > package.json
npm install --silent --no-audit --no-fund "$TARBALL" "typescript@^5" >/dev/null || fail "npm install of the tarball"
cat > index.ts <<'TS'
import BackgroundGeolocation from "cordova-background-geolocation-lt";
import type { Config, Location, State, Subscription } from "cordova-background-geolocation-lt";

const config: Config = {
  geolocation: { desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High, distanceFilter: 10 },
  logger: { logLevel: BackgroundGeolocation.LogLevel.Verbose },
};
export async function start(): Promise<boolean> {
  const state: State = await BackgroundGeolocation.ready(config);
  const sub: Subscription = BackgroundGeolocation.onLocation((location: Location) => location.coords.latitude);
  sub.remove();
  return state.enabled;
}
TS
for mode in "node16 node16" "esnext bundler"; do
  set -- $mode
  ./node_modules/.bin/tsc --strict --noEmit --skipLibCheck false --target es2020 --lib es2020,dom \
    --module "$1" --moduleResolution "$2" index.ts \
    || fail "a strict consumer does not compile under moduleResolution $2"
done
ok "strict TypeScript compiles under node16 and bundler resolution"

echo
echo "${GREEN}preflight passed${RESET} — $NAME@$VERSION"
