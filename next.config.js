// eslint-disable-next-line @typescript-eslint/no-var-requires
const { env } = require('./src/server/env')

const { withRoutes } = require('nextjs-routes/next-config.cjs')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function getConfig(config) {
  return config
}

/**
 * @link https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
module.exports = withBundleAnalyzer(
  withRoutes(
    getConfig({
      output: 'standalone',
      reactStrictMode: true,
      swcMinify: true,

      /**
       * Dynamic configuration available for the browser and server.
       * Note: requires `ssr: true` or a `getInitialProps` in `_app.tsx`
       * @link https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
       */
      publicRuntimeConfig: {
        NODE_ENV: env.NODE_ENV,
      },
    })
  )
)
