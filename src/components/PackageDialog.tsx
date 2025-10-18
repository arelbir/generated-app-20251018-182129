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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { PackageDefinition, Device } from '@shared/types'
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
import { packageDefinitionSchema } from '@/lib/schemas'
import { z } from 'zod'
type PackageFormValues = z.infer<typeof packageDefinitionSchema>
interface PackageDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  pkg?: PackageDefinition | null
}
export function PackageDialog({ isOpen, onOpenChange, pkg }: PackageDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!pkg
  const { data: devices, isLoading: isLoadingDevices } = useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: () => api('/api/settings/devices'),
  })
  const form = useForm({
    resolver: zodResolver(packageDefinitionSchema),
    defaultValues: {
      name: '',
      deviceName: '',
      totalSessions: 12,
      price: 0,
      durationDays: 90,
    },
  })
  useEffect(() => {
    if (isOpen) {
      if (isEditing && pkg) {
        form.reset(pkg)
      } else {
        form.reset({
          name: '',
          deviceName: '',
          totalSessions: 12,
          price: 0,
          durationDays: 90,
        })
      }
    }
  }, [isOpen, isEditing, pkg, form])
  const mutation = useMutation({
    mutationFn: (values: PackageFormValues) => {
      const url = isEditing
        ? `/api/settings/packages/${pkg!.id}`
        : '/api/settings/packages'
      const method = isEditing ? 'PUT' : 'POST'
      return api(url, { method, body: JSON.stringify(values) })
    },
    onSuccess: () => {
      toast.success(
        `Paket başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}!`
      )
      queryClient.invalidateQueries({ queryKey: ['package-definitions'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`İşlem başarısız: ${error.message}`)
    },
  })
  const onSubmit = (values: PackageFormValues) => {
    mutation.mutate(values)
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Paket Düzenle' : 'Yeni Paket Ekle'}
          </DialogTitle>
          <DialogDescription>
            Stüdyoda sunulan hizmet paketlerini tanımlayın.
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
                  <FormLabel>Paket Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: 12 Seans Vacu Activ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cihaz</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingDevices}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Cihaz seçin..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {devices?.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="totalSessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seans Sayısı</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ücret (TL)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Süre (Gün)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
            </div>
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? 'Kaydediliyor...'
                  : isEditing
                  ? 'Değişiklikleri Kaydet'
                  : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}