import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | undefined
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: undefined,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    const error = this.state.error

    if (error) {
      return (
        <div className='w-full h-full flex justify-center p-10'>
          <div>
            <div className='text-2xl font-bold'>Something went wrong :(</div>
            <div className='mt-2'>
              <code className='text-red-600 font-bold'>{error.toString()}</code>
            </div>
            {error.stack && (
              <details className='mt-2 text-gray-500'>
                <summary>Details</summary>
                <code className='text-sm'>{error.stack}</code>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
