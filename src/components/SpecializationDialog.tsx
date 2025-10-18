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
import { SpecializationDefinition } from '@shared/types'
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
import { specializationSchema, SpecializationFormValues } from '@/lib/schemas'
interface SpecializationDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  specialization?: SpecializationDefinition | null
}
export function SpecializationDialog({
  isOpen,
  onOpenChange,
  specialization,
}: SpecializationDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!specialization
  const form = useForm<SpecializationFormValues>({
    resolver: zodResolver(specializationSchema),
    defaultValues: {
      name: '',
    },
  })
  useEffect(() => {
    if (isOpen) {
      if (isEditing && specialization) {
        form.reset({ name: specialization.name })
      } else {
        form.reset({ name: '' })
      }
    }
  }, [isOpen, isEditing, specialization, form])
  const mutation = useMutation({
    mutationFn: (values: SpecializationFormValues) => {
      const url = isEditing
        ? `/api/settings/specializations/${specialization!.id}`
        : '/api/settings/specializations'
      const method = isEditing ? 'PUT' : 'POST'
      return api(url, { method, body: JSON.stringify(values) })
    },
    onSuccess: () => {
      toast.success(
        `Uzmanlık alanı başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}!`
      )
      queryClient.invalidateQueries({ queryKey: ['specializations'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`İşlem başarısız: ${error.message}`)
    },
  })
  const onSubmit = (values: SpecializationFormValues) => {
    mutation.mutate(values)
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Uzmanlık Alanı Düzenle' : 'Yeni Uzmanlık Alanı Ekle'}
          </DialogTitle>
          <DialogDescription>
            Personel için yeni bir uzmanlık alanı tanımlayın.
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
                  <FormLabel>Uzmanlık Alanı Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Pilates" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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