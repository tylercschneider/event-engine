# Releasing the event-engine packages

The publishable `@eventengine/*` packages are released to npm by the
[`publish.yml`](../.github/workflows/publish.yml) workflow, which runs on any
pushed tag matching `v*`.

## What gets published

Every **non-private** workspace package, in dependency order. `pnpm -r publish`
skips `private` packages, so the repo controls what ships by toggling `private`.
Currently published: `@eventengine/core`, `@eventengine/ports`,
`@eventengine/store`. The remaining packages stay `private` until they're set up
for release.

`workspace:*` cross-dependencies are rewritten to the resolved versions at
publish time, and each package's `prepublishOnly` builds its `dist`.

## Version policy

The published packages are versioned in **lockstep** — they all share one
version and bump together — following [Semantic Versioning](https://semver.org):

- **MAJOR** — a breaking change to any published package's API.
- **MINOR** — backwards-compatible features.
- **PATCH** — backwards-compatible fixes.

Pre-1.0 (`0.x`) releases may break in a MINOR bump while the surface settles.

## Cutting a release

1. Land all changes on `main` (green CI).
2. Set every publishable package to the new version (lockstep). The tag must
   match the version in the manifests.
3. Tag and push: `git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push origin vX.Y.Z`.
4. The `Publish` workflow installs, runs lint/typecheck/tests, then
   `pnpm -r publish --access public --provenance` using the `NPM_TOKEN` secret.
5. Verify: `npm view @eventengine/core version`.
