# Daybook desktop

Electron shell for [Daybook](https://quickbooks-mock.vercel.app). Currently a
thin window over the live web app — same data, same login, but with a real
desktop icon, keyboard shortcuts, native menus, and a Windows installer.

A future revision will replace the live URL with a local-first data layer
(SQLite + sync to Supabase) so the app works offline.

## Download

Grab the latest installer from
[Releases](https://github.com/stharpe98-tech/Quickbooks-mock/releases):

- **Windows:** `Daybook-Setup-<version>.exe`
- **Mac (Apple Silicon):** `Daybook-<version>-arm64.dmg`
- **Mac (Intel):** `Daybook-<version>-x64.dmg`
- **Linux:** `Daybook-<version>-x64.AppImage`

> The Windows build is unsigned for now, so SmartScreen will warn the first
> time you run it. Click **More info → Run anyway**. Mac is also unsigned —
> right-click the DMG and choose Open the first time.

## Build locally

```bash
cd desktop
npm install

# Run in dev mode (opens a window pointing at the live URL)
npm start

# Or override which URL to load
DAYBOOK_URL=http://localhost:3000 npm start
```

## Build installers

GitHub Actions builds installers automatically on every `v*` tag (see
`.github/workflows/build-desktop.yml`).

To build locally:

```bash
npm run dist:win    # Windows .exe (NSIS)
npm run dist:mac    # macOS .dmg
npm run dist:linux  # Linux AppImage
```

Output lands in `desktop/dist/`.

## Cutting a release

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow builds Windows, Mac, and Linux installers in parallel and
attaches them to a GitHub Release matching the tag.
