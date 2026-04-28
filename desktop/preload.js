// Preload runs in the renderer's process before the page loads.
// Kept minimal — no Node APIs leaked to the page. We just expose a tiny
// hook so the web app can detect it's running inside the desktop shell.

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("daybook", {
  isDesktop: true,
  platform: process.platform,
});
