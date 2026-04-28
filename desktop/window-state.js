// Tiny window-state persistence. Stores last bounds + maximized flag in
// a JSON file in the user's app-data dir. No external dependency required.

const fs = require("node:fs");
const path = require("node:path");
const { app, screen } = require("electron");

const DEFAULTS = {
  width: 1280,
  height: 820,
  x: undefined,
  y: undefined,
  maximized: false,
};

function file() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function load() {
  try {
    const raw = fs.readFileSync(file(), "utf8");
    const data = JSON.parse(raw);

    // Sanity: if the saved position is off-screen (monitor unplugged etc.),
    // reset to defaults so we don't open in the void.
    const onScreen = screen.getAllDisplays().some((d) => {
      const { x, y, width, height } = d.bounds;
      return (
        data.x !== undefined &&
        data.y !== undefined &&
        data.x >= x - 50 &&
        data.y >= y - 50 &&
        data.x + (data.width || 0) <= x + width + 50 &&
        data.y + (data.height || 0) <= y + height + 50
      );
    });
    if (!onScreen) data.x = data.y = undefined;

    return { ...DEFAULTS, ...data };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(state) {
  try {
    fs.mkdirSync(path.dirname(file()), { recursive: true });
    fs.writeFileSync(file(), JSON.stringify(state, null, 2));
  } catch {
    // Non-fatal — we just won't restore the window position next launch.
  }
}

module.exports = { load, save };
