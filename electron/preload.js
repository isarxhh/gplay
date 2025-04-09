const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  pickFile: () => ipcRenderer.invoke("dialog:openFile"),
  closeWindow: () => ipcRenderer.send("app:closeWindow"),
  readFileAsBlob: async (filePath) => {
    return ipcRenderer.invoke('file:readBlob', filePath);
  }
});
