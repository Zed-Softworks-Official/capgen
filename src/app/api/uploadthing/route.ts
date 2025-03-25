import { createRouteHandler } from 'uploadthing/next'
import { capgenFileRouter } from './core'

export const { GET, POST } = createRouteHandler({
    router: capgenFileRouter,
})
