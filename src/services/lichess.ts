import { LichessUser, LichessEvent } from '@/types'

const BASE_URL = 'https://lichess.org'

class LichessAPI {
  private token: string = ''

  setToken(token: string): void {
    this.token = token
  }

  private headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`
    }
  }

  async getAccount(): Promise<LichessUser> {
    const response = await fetch(`${BASE_URL}/api/account`, {
      headers: this.headers()
    })

    if (response.status === 401) {
      throw new Error('Invalid API token. Please check your token and try again.')
    }

    if (!response.ok) {
      throw new Error(`Failed to get account: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      id: data.id,
      username: data.username,
      rating: data.perfs?.rapid?.rating || data.perfs?.blitz?.rating || data.perfs?.classical?.rating || 1500,
      title: data.title
    }
  }

  async createSeek(initial: number, increment: number): Promise<void> {
    const formData = new URLSearchParams()
    formData.append('rated', 'false')
    formData.append('time', String(initial / 60))
    formData.append('increment', String(increment))

    const response = await fetch(`${BASE_URL}/api/board/seek`, {
      method: 'POST',
      headers: {
        ...this.headers(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })

    if (!response.ok && response.status !== 200) {
      const text = await response.text()
      if (text && !text.includes('ok')) {
        throw new Error(`Failed to create seek: ${response.status}`)
      }
    }
  }

  async makeMove(gameId: string, move: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/board/game/${gameId}/move/${move}`, {
      method: 'POST',
      headers: this.headers()
    })

    if (!response.ok) {
      throw new Error(`Failed to make move: ${response.status}`)
    }
  }

  async resign(gameId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/board/game/${gameId}/resign`, {
      method: 'POST',
      headers: this.headers()
    })

    if (!response.ok) {
      throw new Error(`Failed to resign: ${response.status}`)
    }
  }

  async abort(gameId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/board/game/${gameId}/abort`, {
      method: 'POST',
      headers: this.headers()
    })

    if (!response.ok) {
      throw new Error(`Failed to abort: ${response.status}`)
    }
  }

  streamEvents(
    onEvent: (event: LichessEvent) => void,
    onError: (error: Error) => void
  ): () => void {
    const controller = new AbortController()

    const connect = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/stream/event`, {
          headers: {
            ...this.headers(),
            'Accept': 'application/x-ndjson'
          },
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`Stream connection failed: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            try {
              const event = JSON.parse(trimmed) as LichessEvent
              onEvent(event)
            } catch {
              console.debug('Skipping invalid JSON:', trimmed)
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          onError(error)
        }
      }
    }

    connect()

    return () => {
      controller.abort()
    }
  }

  streamGame(
    gameId: string,
    onEvent: (event: LichessEvent) => void,
    onError: (error: Error) => void
  ): () => void {
    const controller = new AbortController()

    const connect = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/board/game/stream/${gameId}`, {
          headers: {
            ...this.headers(),
            'Accept': 'application/x-ndjson'
          },
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`Game stream connection failed: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            try {
              const event = JSON.parse(trimmed) as LichessEvent
              onEvent(event)
            } catch {
              console.debug('Skipping invalid JSON:', trimmed)
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          onError(error)
        }
      }
    }

    connect()

    return () => {
      controller.abort()
    }
  }
}

export const lichessAPI = new LichessAPI()


