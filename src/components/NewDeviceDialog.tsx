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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Device } from '@shared/types'
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
import { deviceSchema, DeviceFormValues } from '@/lib/schemas'
interface NewDeviceDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}
export function NewDeviceDialog({ isOpen, onOpenChange }: NewDeviceDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      measurementFrequency: 6,
    },
  })
  const createDeviceMutation = useMutation({
    mutationFn: (newDevice: DeviceFormValues) =>
      api<Device>('/api/settings/devices', {
        method: 'POST',
        body: JSON.stringify(newDevice),
      }),
    onSuccess: () => {
      toast.success('Yeni cihaz başarıyla oluşturuldu!')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(`Cihaz oluşturulamadı: ${error.message}`)
    },
  })
  const onSubmit = (values: DeviceFormValues) => {
    createDeviceMutation.mutate(values)
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Cihaz Ekle</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir stüdyo ekipmanı ekleyin.
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
                    <Input placeholder="Vacu Shape" {...field} />
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
                      value={field.value as string ?? ''}
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
                      value={field.value as string ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createDeviceMutation.isPending}>
                {createDeviceMutation.isPending
                  ? 'Kaydediliyor...'
                  : 'Cihaz Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}