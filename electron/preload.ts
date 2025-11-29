import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getToken: () => ipcRenderer.invoke('store:get', 'lichessToken'),
  setToken: (token: string) => ipcRenderer.invoke('store:set', 'lichessToken', token),
  deleteToken: () => ipcRenderer.invoke('store:delete', 'lichessToken')
})


