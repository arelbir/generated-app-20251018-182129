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
import { HealthConditionDefinition } from '@shared/types'
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
import { healthConditionSchema } from '@/lib/schemas'
import { z } from 'zod'
type HealthConditionFormValues = z.infer<typeof healthConditionSchema>
interface HealthConditionDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  condition?: HealthConditionDefinition | null
}
export function HealthConditionDialog({
  isOpen,
  onOpenChange,
  condition,
}: HealthConditionDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!condition
  const form = useForm({
    resolver: zodResolver(healthConditionSchema),
    defaultValues: {
      name: '',
    },
  })
  useEffect(() => {
    if (isOpen) {
      if (isEditing && condition) {
        form.reset({ name: condition.name })
      } else {
        form.reset({ name: '' })
      }
    }
  }, [isOpen, isEditing, condition, form])
  const mutation = useMutation({
    mutationFn: (values: HealthConditionFormValues) => {
      const url = isEditing
        ? `/api/settings/health-conditions/${condition!.id}`
        : '/api/settings/health-conditions'
      const method = isEditing ? 'PUT' : 'POST'
      return api(url, { method, body: JSON.stringify(values) })
    },
    onSuccess: () => {
      toast.success(
        `Rahatsızlık başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}!`
      )
      queryClient.invalidateQueries({ queryKey: ['health-conditions'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`İşlem başarısız: ${error.message}`)
    },
  })
  const onSubmit = (values: HealthConditionFormValues) => {
    mutation.mutate(values)
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Rahatsızlık Düzenle' : 'Yeni Rahatsızlık Ekle'}
          </DialogTitle>
          <DialogDescription>
            Sık karşılaşılan rahatsızlıkları önceden tanımlayın.
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
                  <FormLabel>Rahatsızlık Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Bel Fıtığı" {...field} />
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