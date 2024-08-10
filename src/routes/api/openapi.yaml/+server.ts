import openApiDoc from '../../../../docs/openapi.yaml?raw'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) => {
  let doc = openApiDoc

  const isLocalhost = url.hostname === 'localhost'
  if (isLocalhost) {
    doc = openApiDoc.replace(
      '  - url: https://www.romulus.lol/api',
      `  - url: http://${url.host}/api\n  - url: https://www.romulus.lol/api`,
    )
  }

  return new Response(doc, {
    headers: {
      'Content-Type': 'application/yaml',
    },
  })
}
