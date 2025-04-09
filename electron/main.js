const { app, BrowserWindow } = require('electron');
const { ipcMain, dialog } = require('electron');
require("@electron/remote/main").initialize();
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })
    require("@electron/remote/main").enable(win.webContents);
    win.loadURL('http://localhost:5173');
    win.setAutoHideMenuBar(true);
    win.setMenuBarVisibility(false);

}
ipcMain.handle('dialog:openFile', async () => {
    console.log("📦 ipcMain handler for 'dialog:openFile' registered");
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Audio Files', extensions: ['mp3', 'flac', 'wav', 'm4a'] }
        ]
    });
    return result;
});
ipcMain.handle('file:readBlob', async (_, filePath) => {
    try {
        const data = fs.readFileSync(filePath);
        const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        return buffer;
    } catch (error) {
        console.error("❌ Failed to read file as blob:", error);
        throw error;
    }
});
app.whenReady().then(() => {
    const fs = require('fs');

    ipcMain.on("app:closeWindow", () => {
        const window = BrowserWindow.getFocusedWindow();
        if (window) window.close();
    });
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})