type FetchRetryOptions = {
  retries: number
  retryDelay: number | ((attempt: number, error: unknown, response: Response | null) => number)
  retryOn: number[] | ((attempt: number, error: unknown, response: Response | null) => boolean)
}

export function createFetchRetry(fetch_: typeof fetch, defaults_: Partial<FetchRetryOptions> = {}) {
  if (typeof fetch_ !== 'function') {
    throw new ArgumentError('fetch must be a function')
  }

  if (typeof defaults_ !== 'object') {
    throw new ArgumentError('defaults must be an object')
  }

  if (defaults_.retries !== undefined && !isPositiveInteger(defaults_.retries)) {
    throw new ArgumentError('retries must be a positive integer')
  }

  if (
    defaults_.retryDelay !== undefined &&
    !isPositiveInteger(defaults_.retryDelay) &&
    typeof defaults_.retryDelay !== 'function'
  ) {
    throw new ArgumentError(
      'retryDelay must be a positive integer or a function returning a positive integer',
    )
  }

  if (
    defaults_.retryOn !== undefined &&
    !Array.isArray(defaults_.retryOn) &&
    typeof defaults_.retryOn !== 'function'
  ) {
    throw new ArgumentError('retryOn property expects an array or function')
  }

  const defaults = {
    retries: defaults_.retries ?? 3,
    retryDelay: defaults_.retryDelay ?? 1000,
    retryOn: defaults_.retryOn ?? [],
  }

  return function fetchRetry(
    input: string | URL | globalThis.Request,
    init?: RequestInit & {
      retries?: FetchRetryOptions['retries']
      retryDelay?: FetchRetryOptions['retryDelay']
      retryOn?: FetchRetryOptions['retryOn']
    },
  ) {
    let retries = defaults.retries
    let retryDelay = defaults.retryDelay
    let retryOn = defaults.retryOn

    if (init && init.retries !== undefined) {
      if (isPositiveInteger(init.retries)) {
        retries = init.retries
      } else {
        throw new ArgumentError('retries must be a positive integer')
      }
    }

    if (init && init.retryDelay !== undefined) {
      if (isPositiveInteger(init.retryDelay) || typeof init.retryDelay === 'function') {
        retryDelay = init.retryDelay
      } else {
        throw new ArgumentError(
          'retryDelay must be a positive integer or a function returning a positive integer',
        )
      }
    }

    if (init?.retryOn) {
      if (Array.isArray(init.retryOn) || typeof init.retryOn === 'function') {
        retryOn = init.retryOn
      } else {
        throw new ArgumentError('retryOn property expects an array or function')
      }
    }

    /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
    return new Promise<Response>(function (resolve, reject) {
      const wrappedFetch = function (attempt: number) {
        fetch_(input, init)
          .then(function (response) {
            if (Array.isArray(retryOn) && !retryOn.includes(response.status)) {
              resolve(response)
            } else if (typeof retryOn === 'function') {
              try {
                return Promise.resolve(retryOn(attempt, null, response))
                  .then(function (retryOnResponse) {
                    if (retryOnResponse) {
                      retry(attempt, null, response)
                    } else {
                      resolve(response)
                    }
                  })
                  .catch(reject)
              } catch (error) {
                reject(error)
              }
            } else {
              if (attempt < retries) {
                retry(attempt, null, response)
              } else {
                resolve(response)
              }
            }
          })
          .catch(function (error) {
            if (typeof retryOn === 'function') {
              try {
                Promise.resolve(retryOn(attempt, error, null))
                  .then(function (retryOnResponse) {
                    if (retryOnResponse) {
                      retry(attempt, error, null)
                    } else {
                      reject(error)
                    }
                  })
                  .catch(function (error) {
                    reject(error)
                  })
              } catch (error) {
                reject(error)
              }
            } else if (attempt < retries) {
              retry(attempt, error, null)
            } else {
              reject(error)
            }
          })
      }

      function retry(attempt: number, error: unknown, response: Response | null) {
        const delay =
          typeof retryDelay === 'function' ? retryDelay(attempt, error, response) : retryDelay
        setTimeout(function () {
          wrappedFetch(++attempt)
        }, delay)
      }

      wrappedFetch(0)
    })
    /* eslint-enable @typescript-eslint/prefer-promise-reject-errors */
  }
}

function isPositiveInteger(value: unknown) {
  return Number.isInteger(value) && (value as number) >= 0
}

class CustomError extends Error {
  constructor(name: string, message: string) {
    super(message)
    this.name = name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

class ArgumentError extends CustomError {
  constructor(message: string) {
    super('ArgumentError', message)
  }
}

export const createExponentialBackoffFetch = (fetch_: typeof fetch) =>
  createFetchRetry(fetch_, {
    retryDelay: (attempt) => Math.pow(2, attempt) * 1000, // 1000, 2000, 4000
  })
