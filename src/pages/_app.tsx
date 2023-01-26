import '../../styles/globals.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { AppType } from 'next/dist/shared/lib/utils'

import ErrorBoundary from '../components/ErrorBoundary'
import Layout from '../components/Layout'
import { queryClient, trpcNext } from '../utils/trpc'

const MyApp: AppType = ({ Component, pageProps }) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Layout>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </Layout>
    </QueryClientProvider>
  </ErrorBoundary>
)

export default trpcNext.withTRPC(MyApp)
