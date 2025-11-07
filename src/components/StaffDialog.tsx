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
import { Staff, SpecializationDefinition, PackageDefinition } from '@shared/types'
import { useAuth } from '@/hooks/useAuth'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { staffSchema, StaffFormValues } from '@/lib/schemas'
import { Textarea } from './ui/textarea'
import { format, isValid, parseISO } from 'date-fns'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Separator } from './ui/separator'
import { MultiSelect } from './ui/multi-select'
interface StaffDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  staff?: Staff | null
}
const weekDays: StaffFormValues['workingHours'][0]['day'][] = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
]
export function StaffDialog({ isOpen, onOpenChange, staff }: StaffDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!staff
  const { token, isAuthenticated } = useAuth()
  
  const { data: specializations, isLoading: isLoadingSpecs } = useQuery<
    SpecializationDefinition[]
  >({
    queryKey: ['specializations'],
    enabled: !!token && isAuthenticated && isOpen, // Only when authenticated and dialog open
    queryFn: () => api('/api/specializations').then((res: any) => res.data?.items || []),
  })
  
  const { data: packages, isLoading: isLoadingPackages } = useQuery<
    PackageDefinition[]
  >({
    queryKey: ['package-definitions'],
    enabled: !!token && isAuthenticated && isOpen, // Only when authenticated and dialog open
    queryFn: () => api('/api/packages').then((res: any) => res.data?.items || []),
  })
  const form = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'uzman',
      status: 'active',
      gender: 'Diğer',
      joinDate: format(new Date(), 'yyyy-MM-dd'),
      specializationIds: [],
      notes: '',
      serviceCommissions: [],
      workingHours: [],
    },
  })
  const {
    fields: workingHoursFields,
    append: appendWorkingHour,
    remove: removeWorkingHour,
  } = useFieldArray({
    control: form.control,
    name: 'workingHours',
  })
  const {
    fields: commissionFields,
    append: appendCommission,
    remove: removeCommission,
  } = useFieldArray({
    control: form.control,
    name: 'serviceCommissions',
  })
  useEffect(() => {
    if (isOpen) {
      if (isEditing && staff) {
        const joinDate =
          staff.joinDate && isValid(parseISO(staff.joinDate))
            ? format(parseISO(staff.joinDate), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd')
        form.reset({
          ...staff,
          joinDate,
          specializationIds: staff.specializationIds || [],
          workingHours: staff.workingHours || [],
          serviceCommissions: staff.serviceCommissions || [],
        })
      } else {
        form.reset({
          fullName: '',
          email: '',
          phone: '',
          role: 'uzman',
          status: 'active',
          gender: 'Diğer',
          joinDate: format(new Date(), 'yyyy-MM-dd'),
          specializationIds: [],
          notes: '',
          serviceCommissions: [],
          workingHours: [],
        })
      }
    }
  }, [isOpen, isEditing, staff, form])
  const mutation = useMutation({
    mutationFn: (values: StaffFormValues) => {
      const url = isEditing
        ? `/api/staff/${staff!.id}`
        : '/api/staff'
      const method = isEditing ? 'PUT' : 'POST'
      return api(url, {
        method,
        body: JSON.stringify({
          ...values,
          joinDate: new Date(values.joinDate).toISOString(),
        }),
      })
    },
    onSuccess: () => {
      toast.success(
        `Personel başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}!`
      )
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`İşlem başarısız: ${error.message}`)
    },
  })
  const onSubmit = (values: StaffFormValues) => {
    mutation.mutate(values)
  }
  const specializationOptions =
    specializations?.map((s) => ({ label: s.name, value: s.id })) || []
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
          </DialogTitle>
          <DialogDescription>
            Personel bilgilerini girin ve kaydedin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Ad Soyad</FormLabel><FormControl><Input placeholder="Örn: Deniz Admin" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-posta</FormLabel><FormControl><Input type="email" placeholder="ornek@mail.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefon</FormLabel><FormControl><Input placeholder="555-0201" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="joinDate" render={({ field }) => (<FormItem><FormLabel>İşe Başlama Tarihi</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Rol</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="uzman">Uzman</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Durum</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Pasif</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Cinsiyet</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Kadın">Kadın</SelectItem><SelectItem value="Erkek">Erkek</SelectItem><SelectItem value="Diğer">Diğer</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="specializationIds" render={({ field }) => (<FormItem><FormLabel>Uzmanlık Alanları</FormLabel><FormControl><MultiSelect options={specializationOptions} onValueChange={field.onChange} defaultValue={field.value || []} placeholder="Uzmanlık seçin..." disabled={isLoadingSpecs} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notlar</FormLabel><FormControl><Textarea placeholder="Personel ile ilgili notlar..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <Separator className="my-4" />
            <div>
              <FormLabel>Servis Komisyonları</FormLabel>
              <div className="space-y-2 mt-2">
                {commissionFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField control={form.control} name={`serviceCommissions.${index}.serviceId`} render={({ field }) => (<FormItem className="flex-1"><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPackages}><FormControl><SelectTrigger><SelectValue placeholder="Servis seçin..." /></SelectTrigger></FormControl><SelectContent>{packages?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                    <FormField control={form.control} name={`serviceCommissions.${index}.rate`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Oran %" {...field} className="w-28" onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} value={field.value as string ?? ''} /></FormControl></FormItem>)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCommission(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendCommission({ serviceId: '', rate: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Komisyon Ekle</Button>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <FormLabel>Çalışma Saatleri</FormLabel>
              <div className="space-y-2 mt-2">
                {workingHoursFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField control={form.control} name={`workingHours.${index}.day`} render={({ field }) => (<FormItem className="flex-1"><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{weekDays.map((day) => (<SelectItem key={day} value={day}>{day}</SelectItem>))}</SelectContent></Select></FormItem>)} />
                    <FormField control={form.control} name={`workingHours.${index}.startTime`} render={({ field }) => (<FormItem><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name={`workingHours.${index}.endTime`} render={({ field }) => (<FormItem><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeWorkingHour(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendWorkingHour({ day: 'Pazartesi', startTime: '09:00', endTime: '18:00' })}><PlusCircle className="mr-2 h-4 w-4" /> Saat Ekle</Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Kaydediliyor...' : isEditing ? 'Değişiklikleri Kaydet' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}