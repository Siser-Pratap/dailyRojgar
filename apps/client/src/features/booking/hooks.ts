import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import {
  cancelBooking,
  createBooking,
  getBooking,
  listBookings,
  workerBookingAction,
  type ListBookingsParams,
  type WorkerBookingAction,
} from './api'

export function useBookings(params: ListBookingsParams = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => listBookings(params),
    placeholderData: keepPreviousData,
  })
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking request sent')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not create booking')),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelBooking(id, reason),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', booking._id] })
      toast.success('Booking cancelled')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not cancel booking')),
  })
}

const actionLabel: Record<WorkerBookingAction, string> = {
  accept: 'Booking accepted',
  reject: 'Booking rejected',
  start: 'Job started',
  complete: 'Job completed',
}

export function useWorkerBookingAction() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string
      action: WorkerBookingAction
      reason?: string
    }) => workerBookingAction(id, action, reason),
    onSuccess: (booking, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', booking._id] })
      toast.success(actionLabel[variables.action])
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Action failed')),
  })
}
