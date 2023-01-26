import {
  DefaultOptions,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { createTRPCNext } from '@trpc/next'
import {
  createTRPCReact,
  httpBatchLink,
  loggerLink,
  TRPCClientErrorLike,
} from '@trpc/react-query'
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server'
import { NextPageContext } from 'next'
import superjson from 'superjson'

import type { AppRouter } from '../server/routers/_app'
import { isBrowser } from './dom'
import { showErrorToast } from './error'

export const trpc = createTRPCReact<AppRouter>()

const queryCache = new QueryCache({
  onError: (error, query) => {
    // TODO: tell typescript that showToast is a valid option
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (query.options.showToast) {
      void showErrorToast(error)
    }
  },
})

const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    // TODO: tell typescript that showToast is a valid option
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (mutation.options.showToast) {
      void showErrorToast(error)
    }
  },
})

const defaultOptions: DefaultOptions = {
  // TODO: tell typescript that showToast is a valid option
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  queries: { showToast: true },

  // TODO: tell typescript that showToast is a valid option
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mutations: { showToast: true },
}

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions,
})

export interface SSRContext extends NextPageContext {
  status?: number
}

export const trpcNext = createTRPCNext<AppRouter, SSRContext>({
  config: ({ ctx }) => ({
    transformer: superjson,
    queryClient,
    headers: {
      cookie: ctx?.req?.headers.cookie,
    },
    links: [
      // adds pretty logs to your console in development and logs errors in production
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseTrpcUrl()}/api/trpc`,
        headers() {
          if (ctx?.req) {
            // To use SSR properly, you need to forward the client's headers to the server
            // This is so you can pass through things like cookies when we're server-side rendering

            // If you're using Node 18, omit the "connection" header
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { connection: _connection, ...headers } = ctx.req.headers
            return {
              ...headers,
              // Optional: inform server that it's an SSR request
              'x-ssr': '1',
            }
          }
          return {}
        },
      }),
    ],
  }),
  responseMeta(opts) {
    const ctx = opts.ctx as SSRContext

    if (ctx.status) {
      // If HTTP status set, propagate that
      return {
        status: ctx.status,
      }
    }

    const error = opts.clientErrors[0]
    if (error) {
      // Propagate http first error from API calls
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        status: error.data?.httpStatus ?? 500,
      }
    }

    // for app caching with SSR see https://trpc.io/docs/caching

    return {}
  },
  ssr: true,
})

/**
 * Enum containing all api query paths
 */
export type TQuery = keyof AppRouter['_def']['queries']

/**
 * Enum containing all api mutation paths
 */
export type TMutation = keyof AppRouter['_def']['mutations']

/**
 * Enum containing all api subscription paths
 */
export type TSubscription = keyof AppRouter['_def']['subscriptions']

export type TError = TRPCClientErrorLike<AppRouter>

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = InferQueryOutput<'hello'>
 */
export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter['_def']['queries'][TRouteKey]
>

/**
 * This is a helper method to infer the input of a query resolver
 * @example type HelloInput = InferQueryInput<'hello'>
 */
export type InferQueryInput<TRouteKey extends TQuery> = inferProcedureInput<
  AppRouter['_def']['queries'][TRouteKey]
>

/**
 * This is a helper method to infer the output of a mutation resolver
 * @example type HelloOutput = InferMutationOutput<'hello'>
 */
export type InferMutationOutput<TRouteKey extends TMutation> =
  inferProcedureOutput<AppRouter['_def']['mutations'][TRouteKey]>

/**
 * This is a helper method to infer the input of a mutation resolver
 * @example type HelloInput = InferMutationInput<'hello'>
 */
export type InferMutationInput<TRouteKey extends TMutation> =
  inferProcedureInput<AppRouter['_def']['mutations'][TRouteKey]>

/**
 * This is a helper method to infer the output of a subscription resolver
 * @example type HelloOutput = InferSubscriptionOutput<'hello'>
 */
export type InferSubscriptionOutput<TRouteKey extends TSubscription> =
  inferProcedureOutput<AppRouter['_def']['subscriptions'][TRouteKey]>

/**
 * This is a helper method to infer the input of a subscription resolver
 * @example type HelloInput = InferSubscriptionInput<'hello'>
 */
export type InferSubscriptionInput<TRouteKey extends TSubscription> =
  inferProcedureInput<AppRouter['_def']['subscriptions'][TRouteKey]>

export const getBaseTrpcUrl = () => {
  if (isBrowser) {
    return ''
  }

  // Digital Ocean
  if (process.env.DIGITAL_OCEAN_URL) {
    return `https://www.romulus.lol`
  }

  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  return 'http://localhost:3000'
}
