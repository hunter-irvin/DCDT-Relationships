import { handleLayoutRequest } from '../server/routes/layout'

interface Env {
  ASSETS: Fetcher
  DB?: D1Database
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/layout') {
      return handleLayoutRequest(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}

export default worker
