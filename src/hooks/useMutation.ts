import { useState, useCallback } from 'react'
import { useToast } from './useToast'

export interface MutationOptions<TData, TVariables = void> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>
  onError?: (error: any, variables: TVariables) => void | Promise<void>
  successTitle?: string
  successMessage?: string | ((data: TData, variables: TVariables) => string)
  errorTitle?: string
  errorMessage?: string | ((error: any, variables: TVariables) => string)
}

export interface UseMutationResult<TData, TVariables = void> {
  mutate: (variables: TVariables) => Promise<TData | null>
  mutateAsync: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  data: TData | null
  error: any
  reset: () => void
}

/**
 * Standard Pessimistic Mutation Hook for EnglishFlow LMS
 *
 * Rules:
 * 1. Shows loading indicator (disabling buttons/forms).
 * 2. Waits for real backend HTTP 200/201 response with DB-persisted object.
 * 3. Only invokes onSuccess and state update AFTER backend success.
 * 4. In case of API failure, catches error, displays toast error, and prevents fake state updates.
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { success: toastSuccess, error: toastError } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<any>(null)

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsSuccess(false)
    setIsError(false)
    setData(null)
    setError(null)
  }, [])

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true)
      setIsError(false)
      setError(null)
      setIsSuccess(false)

      try {
        const result = await mutationFn(variables)
        setData(result)
        setIsSuccess(true)

        // Show success notification if specified
        if (options.successMessage) {
          const msg =
            typeof options.successMessage === 'function'
              ? options.successMessage(result, variables)
              : options.successMessage
          toastSuccess(options.successTitle || 'Thao tác thành công', msg)
        }

        // Pessimistic update: only update parent state after DB confirms
        if (options.onSuccess) {
          await options.onSuccess(result, variables)
        }

        return result
      } catch (err: any) {
        setIsError(true)
        setError(err)

        const rawMsg =
          err.response?.data?.message ||
          (err.response?.data?.errors && Array.isArray(err.response.data.errors)
            ? err.response.data.errors.map((e: any) => e.message).join(', ')
            : null) ||
          err.message ||
          'Đã có lỗi xảy ra trong quá trình xử lý yêu cầu.'

        const displayMsg =
          typeof options.errorMessage === 'function'
            ? options.errorMessage(err, variables)
            : options.errorMessage || rawMsg

        toastError(options.errorTitle || 'Lỗi thao tác', displayMsg)

        if (options.onError) {
          await options.onError(err, variables)
        }

        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, options, toastSuccess, toastError]
  )

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      try {
        return await mutateAsync(variables)
      } catch {
        return null
      }
    },
    [mutateAsync]
  )

  return {
    mutate,
    mutateAsync,
    isLoading,
    isSuccess,
    isError,
    data,
    error,
    reset,
  }
}

