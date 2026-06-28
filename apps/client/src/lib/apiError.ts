import { AxiosError } from 'axios'

/** Extracts a human-readable message from an API/Axios error. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? error.message ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}
