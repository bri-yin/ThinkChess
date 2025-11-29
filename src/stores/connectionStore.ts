import { create } from 'zustand'
import { LichessUser } from '@/types'
import { lichessAPI } from '@/services/lichess'
import { electronAPI } from '@/utils/electron'

interface ConnectionState {
  token: string | null
  user: LichessUser | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

interface ConnectionActions {
  loadToken: () => Promise<void>
  connect: (token: string) => Promise<void>
  disconnect: () => Promise<void>
  clearError: () => void
}

export const useConnectionStore = create<ConnectionState & ConnectionActions>((set, get) => ({
  token: null,
  user: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  loadToken: async () => {
    try {
      const token = await electronAPI.getToken()
      if (token) {
        await get().connect(token)
      }
    } catch (e) {
      console.error('Failed to load token:', e)
    }
  },

  connect: async (token: string) => {
    set({ isConnecting: true, error: null })
    
    try {
      lichessAPI.setToken(token)
      const user = await lichessAPI.getAccount()
      
      await electronAPI.setToken(token)
      
      set({
        token,
        user,
        isConnected: true,
        isConnecting: false,
        error: null
      })
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to connect'
      set({
        token: null,
        user: null,
        isConnected: false,
        isConnecting: false,
        error
      })
      lichessAPI.setToken('')
    }
  },

  disconnect: async () => {
    try {
      await electronAPI.deleteToken()
    } catch (e) {
      console.error('Failed to delete token:', e)
    }
    
    lichessAPI.setToken('')
    set({
      token: null,
      user: null,
      isConnected: false,
      isConnecting: false,
      error: null
    })
  },

  clearError: () => {
    set({ error: null })
  }
}))


