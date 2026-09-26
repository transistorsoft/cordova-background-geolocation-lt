#!/usr/bin/env bash
# Cut a release in the two steps master allows (master only takes merges):
#
#   npm run release -- prepare 5.4.2   branch chore/release-5.4.2 from master: set the version (package.json
#                                      and plugin.xml), date the CHANGELOG's Unreleased section, preflight, commit
#   (merge chore/release-5.4.2 into master)
#   npm run release -- tag 5.4.2       tag that merge, lightweight like every earlier tag
#
# It never pushes. `git push origin master 5.4.2` is yours; the tag starts
# .github/workflows/release.yml, which publishes to npm (RELEASING.md).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
die() { echo "release: $*" >&2; exit 1; }

cmd="${1:-}"; VERSION="${2:-}"
[ -n "$cmd" ] && [ -n "$VERSION" ] || die "usage: npm run release -- prepare|tag <version>"
echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$' || die "'$VERSION' is not a version (5.4.2, 5.5.0-beta.1)"
[ -z "$(git status --porcelain)" ] || die "the working tree is not clean"

case "$cmd" in
prepare)
  [ "$(git branch --show-current)" = master ] || die "run prepare on master"
  git fetch -q origin master
  [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/master)" ] || die "master is not origin/master — pull or push first"
  ! git rev-parse -q --verify "refs/tags/$VERSION" >/dev/null || die "tag $VERSION already exists"
  ! git rev-parse -q --verify "refs/heads/chore/release-$VERSION" >/dev/null || die "branch chore/release-$VERSION already exists"
  current="$(node -p "require('./package.json').version")"
  # A version can be published once, ever: going backwards or repeating one fails at npm,
  # after the tag is already public.
  node -e '
    const [a, b] = process.argv.slice(1).map(v => v.split("-"));
    const n = x => x[0].split(".").map(Number);
    const [x, y] = [n(a), n(b)];
    const cmp = x[0] - y[0] || x[1] - y[1] || x[2] - y[2] || (a[1] ? (b[1] ? (a[1] > b[1]) - (a[1] < b[1]) : -1) : (b[1] ? 1 : 0));
    process.exit(cmp > 0 ? 0 : 1);' "$VERSION" "$current" || die "$VERSION is not greater than package.json's $current"
  grep -q '^## Unreleased' CHANGELOG.md || die "the CHANGELOG has no '## Unreleased' section to release"
  awk '/^## Unreleased/{f=1; next} /^## /{exit} f && /^\* /{found=1} END{exit !found}' CHANGELOG.md \
    || die "the CHANGELOG's Unreleased section has no entries"

  git checkout -q -b "chore/release-$VERSION"
  npm version --no-git-tag-version "$VERSION" >/dev/null
  # Cordova reads the <plugin> element's version, not package.json's (not the <?xml?> declaration).
  perl -0pi -e 's/(<plugin\b[^>]*?\bversion=")[^"]*(")/${1}'"$VERSION"'${2}/s' plugin.xml
  sed -i.bak "s/^## Unreleased\$/## $VERSION \&mdash; $(date +%Y-%m-%d)/" CHANGELOG.md && rm CHANGELOG.md.bak
  scripts/preflight.sh --release
  # npm version also sets the version in a package-lock.json — committed only if the repo tracks one.
  git add package.json plugin.xml CHANGELOG.md $(git ls-files package-lock.json)
  git commit -q -m "chore(release): $VERSION"
  echo
  echo "chore/release-$VERSION is ready. Merge it into master, then: npm run release -- tag $VERSION"
  ;;
tag)
  [ "$(git branch --show-current)" = master ] || die "run tag on master, after merging chore/release-$VERSION"
  ! git rev-parse -q --verify "refs/tags/$VERSION" >/dev/null || die "tag $VERSION already exists"
  [ -n "$(git rev-parse -q --verify HEAD^2 2>/dev/null)" ] || die "HEAD is not a merge — merge chore/release-$VERSION first"
  [ "$(node -p "require('./package.json').version")" = "$VERSION" ] || die "master's package.json is not $VERSION"
  scripts/preflight.sh --release
  git tag "$VERSION"
  echo
  echo "Tagged $VERSION on $(git log -1 --format='%h %s'). To publish:"
  echo
  echo "    git push origin master $VERSION"
  echo
  echo "The tag starts the release workflow: check, then npm publish with provenance."
  ;;
*)
  die "usage: npm run release -- prepare|tag <version>"
  ;;
esac
