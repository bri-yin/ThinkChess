import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

const isDev = !app.isPackaged

// Simple file-based store for token
const getConfigPath = () => path.join(app.getPath('userData'), 'config.json')

function readConfig(): Record<string, string> {
  try {
    const configPath = getConfigPath()
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8')
      const decoded = Buffer.from(data, 'base64').toString('utf-8')
      return JSON.parse(decoded)
    }
  } catch (e) {
    console.error('Failed to read config:', e)
  }
  return {}
}

function writeConfig(config: Record<string, string>): void {
  try {
    const configPath = getConfigPath()
    const encoded = Buffer.from(JSON.stringify(config)).toString('base64')
    fs.writeFileSync(configPath, encoded, 'utf-8')
  } catch (e) {
    console.error('Failed to write config:', e)
  }
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    backgroundColor: '#0f172a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handlers for secure token storage
ipcMain.handle('store:get', (_event, key: string) => {
  const config = readConfig()
  return config[key] || null
})

ipcMain.handle('store:set', (_event, key: string, value: string) => {
  const config = readConfig()
  config[key] = value
  writeConfig(config)
  return true
})

ipcMain.handle('store:delete', (_event, key: string) => {
  const config = readConfig()
  delete config[key]
  writeConfig(config)
  return true
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


