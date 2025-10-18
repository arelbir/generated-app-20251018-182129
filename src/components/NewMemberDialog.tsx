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
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Member } from '@shared/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
interface NewMemberDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}
const newMemberSchema = z.object({
  fullName: z.string().min(2, { message: 'Ad Soyad en az 2 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçerli bir e-posta adresi girin.' }),
  phone: z.string().min(10, { message: 'Telefon numarası en az 10 karakter olmalıdır.' }),
})
type NewMemberFormValues = z.infer<typeof newMemberSchema>
export function NewMemberDialog({ isOpen, onOpenChange }: NewMemberDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<NewMemberFormValues>({
    resolver: zodResolver(newMemberSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  })
  const createMemberMutation = useMutation({
    mutationFn: (newMember: NewMemberFormValues) =>
      api<Member>('/api/members', {
        method: 'POST',
        body: JSON.stringify(newMember),
      }),
    onSuccess: () => {
      toast.success('Yeni üye başarıyla oluşturuldu!')
      queryClient.invalidateQueries({ queryKey: ['members'] })
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(`Üye oluşturulamadı: ${error.message}`)
    },
  })
  const onSubmit = (values: NewMemberFormValues) => {
    createMemberMutation.mutate(values)
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Üye Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir demo veya aktif üye kaydı oluşturun.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Soyad</FormLabel>
                  <FormControl>
                    <Input placeholder="Elif Akbaş" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input placeholder="ornek@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="555-0101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createMemberMutation.isPending}>
                {createMemberMutation.isPending ? 'Kaydediliyor...' : 'Üye Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}