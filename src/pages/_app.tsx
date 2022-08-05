import '../../styles/globals.css'

import { withTRPC } from '@trpc/next'
import { AppType } from 'next/dist/shared/lib/utils'
import { Toaster } from 'react-hot-toast'
import {
  DefaultOptions,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from 'react-query'

import Navbar from '../components/Navbar'
import { AppRouter } from '../server/routers/_app'
import { isBrowser } from '../utils/dom'
import { showErrorToast } from '../utils/error'

const queryCache = new QueryCache({
  onError: (error, query) => {
    // TODO: tell typescript that showToast is a valid option
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (query.options.showToast) {
      showErrorToast(error)
    }
  },
})

const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    // TODO: tell typescript that showToast is a valid option
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (mutation.options.showToast) {
      showErrorToast(error)
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

const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions,
})

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='w-screen h-screen flex flex-col'>
        <Navbar />

        <div className='flex-1'>
          <Component {...pageProps} />
        </div>

        <Toaster />
      </div>
    </QueryClientProvider>
  )
}

const getBaseUrl = () => {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV

  if (env === 'production') {
    return `https://www.romulus.lol`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`

    return {
      url,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      queryClientConfig: {
        queryCache,
        mutationCache,
        defaultOptions,
      },
      headers: isBrowser
        ? undefined
        : () => {
            const cookieStr = ctx?.req?.headers.cookie

            if (cookieStr) {
              return { Cookie: cookieStr }
            }

            return {}
          },
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp)
