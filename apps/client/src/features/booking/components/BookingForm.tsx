import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Input, Textarea } from '@/components/ui'
import { zodResolver } from '@/lib/zodResolver'
import { formatCurrency } from '@/lib/utils'
import { useCreateBooking } from '../hooks'
import type { Booking } from '../api'

const PLATFORM_FEE_PERCENT = 10

const bookingSchema = z.object({
  date: z.string().min(1, 'Pick a date'),
  time: z.string().min(1, 'Pick a time'),
  durationDays: z.coerce.number().min(1, 'At least 1 day').max(30),
  street: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  pincode: z.string().trim().max(10).optional(),
  description: z.string().trim().max(2000).optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

export interface BookingWorkerInfo {
  id: string
  name: string
  categoryId: string
  pricePerDay: number
}

export function BookingForm({
  worker,
  onCreated,
}: {
  worker: BookingWorkerInfo
  onCreated: (booking: Booking) => void
}) {
  const createMutation = useCreateBooking()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { durationDays: 1 },
  })

  const durationDays = Number(watch('durationDays')) || 1
  const amount = worker.pricePerDay * durationDays
  const platformFee = Math.round((amount * PLATFORM_FEE_PERCENT) / 100)
  const total = amount + platformFee

  const onSubmit = (values: BookingFormValues) => {
    const scheduledDate = new Date(`${values.date}T${values.time}`).toISOString()
    createMutation.mutate(
      {
        workerId: worker.id,
        categoryId: worker.categoryId,
        scheduledDate,
        durationDays: values.durationDays,
        amount,
        address: {
          street: values.street || undefined,
          city: values.city,
          pincode: values.pincode || undefined,
        },
        description: values.description || undefined,
      },
      { onSuccess: onCreated },
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          min={today}
          error={errors.date?.message}
          {...register('date')}
        />
        <Input label="Time" type="time" error={errors.time?.message} {...register('time')} />
      </div>
      <Input
        label="Duration (days)"
        type="number"
        min={1}
        max={30}
        error={errors.durationDays?.message}
        {...register('durationDays')}
      />
      <Input
        label="Street / area"
        placeholder="Optional"
        error={errors.street?.message}
        {...register('street')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="City"
          placeholder="Noida"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label="Pincode"
          placeholder="Optional"
          error={errors.pincode?.message}
          {...register('pincode')}
        />
      </div>
      <Textarea
        label="Work description"
        placeholder="Describe what you need done"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">
            {formatCurrency(worker.pricePerDay)} × {durationDays} day{durationDays > 1 ? 's' : ''}
          </span>
          <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-gray-600">Platform fee ({PLATFORM_FEE_PERCENT}%)</span>
          <span className="font-medium text-gray-900">{formatCurrency(platformFee)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
          <span className="font-semibold text-gray-950">Total</span>
          <span className="font-bold text-gray-950">{formatCurrency(total)}</span>
        </div>
      </div>

      <Button type="submit" size="lg" fullWidth isLoading={createMutation.isPending}>
        Confirm booking
      </Button>
    </form>
  )
}
