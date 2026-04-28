// Daybook desktop entry point.
// For now this is a thin Electron shell that loads the deployed Daybook
// web app. The plan is to replace this with a local-first variant later
// (better-sqlite3 + sync layer) so the app works offline.

const { app, BrowserWindow, Menu, shell, nativeTheme } = require("electron");
const path = require("node:path");

const APP_URL = process.env.DAYBOOK_URL || "https://quickbooks-mock.vercel.app";

// Persist window size/position between launches without pulling in another dep.
const Store = require("./window-state.js");

function createWindow() {
  const state = Store.load();

  const win = new BrowserWindow({
    title: "Daybook",
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0f172a" : "#f8fafc",
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (state.maximized) win.maximize();

  win.loadURL(APP_URL);

  // Open external http(s) links in the user's default browser instead of a
  // new BrowserWindow (e.g. magic-link emails, Stripe pages, etc.).
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const sameOrigin = url.startsWith(APP_URL);
      if (!sameOrigin) {
        shell.openExternal(url);
        return { action: "deny" };
      }
    }
    return { action: "allow" };
  });

  // Same idea for in-page navigations to other origins.
  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(APP_URL) && (url.startsWith("http://") || url.startsWith("https://"))) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Save window state on close.
  win.on("close", () => {
    if (!win.isDestroyed()) {
      Store.save({
        ...win.getNormalBounds(),
        maximized: win.isMaximized(),
      });
    }
  });

  return win;
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "Open Daybook",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (win) win.loadURL(APP_URL);
          },
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac ? [{ type: "separator" }, { role: "front" }] : [{ role: "close" }]),
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Open Daybook in browser",
          click: () => shell.openExternal(APP_URL),
        },
        {
          label: "Source on GitHub",
          click: () =>
            shell.openExternal("https://github.com/stharpe98-tech/Quickbooks-mock"),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
