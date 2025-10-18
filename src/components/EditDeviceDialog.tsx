import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Device, SpecializationDefinition } from '@shared/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useEffect } from 'react'
import { deviceSchema, DeviceFormValues } from '@/lib/schemas'
import { MultiSelect } from './ui/multi-select'
interface EditDeviceDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  device: Device | null
}
export function EditDeviceDialog({
  isOpen,
  onOpenChange,
  device,
}: EditDeviceDialogProps) {
  const queryClient = useQueryClient()
  const { data: specializations, isLoading: isLoadingSpecs } = useQuery<
    SpecializationDefinition[]
  >({
    queryKey: ['specializations'],
    queryFn: () => api('/api/settings/specializations'),
  })
  const form = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      measurementFrequency: null,
      requiredSpecializationIds: [],
    },
  })
  useEffect(() => {
    if (device && isOpen) {
      form.reset({
        name: device.name,
        quantity: device.quantity,
        measurementFrequency: device.measurementFrequency,
        requiredSpecializationIds: device.requiredSpecializationIds || [],
      })
    }
  }, [device, form, isOpen])
  const updateDeviceMutation = useMutation({
    mutationFn: (updatedDevice: DeviceFormValues) =>
      api<Device>(`/api/settings/devices/${device?.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDevice),
      }),
    onSuccess: () => {
      toast.success('Cihaz başarıyla güncellendi!')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`Cihaz güncellenemedi: ${error.message}`)
    },
  })
  const onSubmit = (values: DeviceFormValues) => {
    if (!device) return
    updateDeviceMutation.mutate(values)
  }
  const specializationOptions =
    specializations?.map((s) => ({ label: s.name, value: s.id })) || []
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cihazı Düzenle</DialogTitle>
          <DialogDescription>
            Cihaz bilgilerini güncelleyin. Değişiklikler kaydedildiğinde
            yansıyacaktır.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cihaz Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Vacu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sayı</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="3"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurementFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ölçüm Limiti (Seans)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="6"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? null
                            : parseInt(e.target.value, 10)
                        )
                      }
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiredSpecializationIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gerekli Uzmanlık Alanları</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={specializationOptions}
                      onValueChange={field.onChange}
                      defaultValue={field.value || []}
                      placeholder="Uzmanlık seçin..."
                      disabled={isLoadingSpecs}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={updateDeviceMutation.isPending}>
                {updateDeviceMutation.isPending
                  ? 'Kaydediliyor...'
                  : 'Değişiklikleri Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}