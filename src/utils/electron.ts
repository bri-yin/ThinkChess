// Browser fallback for electronAPI when running in web mode
// Uses localStorage instead of secure Electron storage

const browserFallback = {
  getToken: async (): Promise<string | null> => {
    return localStorage.getItem('lichessToken')
  },
  setToken: async (token: string): Promise<boolean> => {
    localStorage.setItem('lichessToken', token)
    return true
  },
  deleteToken: async (): Promise<boolean> => {
    localStorage.removeItem('lichessToken')
    return true
  }
}

// Use electronAPI if available (Electron), otherwise use browser fallback
export const electronAPI = window.electronAPI || browserFallback


