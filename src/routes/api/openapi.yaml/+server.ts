import openApiDoc from '../../../../docs/openapi.yaml?raw'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => {
  const doc = openApiDoc.replace(
    '  - url: https://www.romulus.lol/api',
    `  - url: ${url.protocol}//${url.host}/api`,
  )

  return new Response(doc, {
    headers: {
      'Content-Type': 'application/yaml',
    },
  })
}
