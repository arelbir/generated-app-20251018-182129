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
import { useEffect } from 'react'
interface EditMemberDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  member: Member | null
}
const editMemberSchema = z.object({
  fullName: z.string().min(2, { message: 'Ad Soyad en az 2 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçerli bir e-posta adresi girin.' }),
  phone: z.string().min(10, { message: 'Telefon numarası en az 10 karakter olmalıdır.' }),
})
type EditMemberFormValues = z.infer<typeof editMemberSchema>
export function EditMemberDialog({
  isOpen,
  onOpenChange,
  member,
}: EditMemberDialogProps) {
  const queryClient = useQueryClient()
  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
  })
  useEffect(() => {
    if (member) {
      form.reset({
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
      })
    }
  }, [member, form, isOpen])
  const updateMemberMutation = useMutation({
    mutationFn: (updatedMember: Partial<Member>) =>
      api<Member>(`/api/members/${member?.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedMember),
      }),
    onSuccess: (updatedData) => {
      toast.success('Üye bilgileri başarıyla güncellendi!')
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.setQueryData(['member', member?.id], updatedData)
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`Üye güncellenemedi: ${error.message}`)
    },
  })
  const onSubmit = (values: EditMemberFormValues) => {
    if (!member) return
    updateMemberMutation.mutate(values)
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Üye Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Üyenin temel bilgilerini güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
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
              <Button type="submit" disabled={updateMemberMutation.isPending}>
                {updateMemberMutation.isPending
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