import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { api } from '@/lib/api-client'
import { Member } from '@shared/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  Trash2,
  PlusCircle,
  User,
  HeartPulse,
  Scale,
  Package,
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { memberSchema, MemberFormInput, MemberFormValues } from '@/lib/schemas'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { useEffect } from 'react'
function EditMemberSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
export function EditMemberPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: member, isLoading } = useQuery<Member>({
    queryKey: ['member', id],
    queryFn: () => api(`/api/members/${id}`),
    enabled: !!id,
  })
  const form = useForm<MemberFormInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      gender: 'Kadın',
      isVeiled: false,
      notes: '',
      healthConditions: [],
      measurements: [],
      packages: [],
    },
  })
  useEffect(() => {
    if (member) {
      form.reset({
        ...member,
        healthConditions: member.healthConditions.map((value) => ({ value })),
        measurements: member.measurements || [],
        packages: member.packages || [],
      })
    }
  }, [member, form])
  const {
    fields: measurementFields,
    append: appendMeasurement,
    remove: removeMeasurement,
  } = useFieldArray({
    control: form.control,
    name: 'measurements',
  })
  const {
    fields: healthFields,
    append: appendHealth,
    remove: removeHealth,
  } = useFieldArray({
    control: form.control,
    name: 'healthConditions',
  })
  const updateMemberMutation = useMutation({
    mutationFn: (updatedMember: MemberFormValues) =>
      api<Member>(`/api/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedMember),
      }),
    onSuccess: (data) => {
      toast.success('Üye bilgileri başarıyla güncellendi!')
      queryClient.setQueryData(['member', id], data)
      queryClient.invalidateQueries({ queryKey: ['members'] })
      navigate(`/members/${id}`)
    },
    onError: (error) => {
      toast.error(`Üye güncellenemedi: ${error.message}`)
    },
  })
  const onSubmit = (values: MemberFormValues) => {
    updateMemberMutation.mutate(values)
  }
  if (isLoading) return <EditMemberSkeleton />
  if (!member) return <div>Üye bulunamadı.</div>
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight font-display">
            Üye Düzenle: {member.fullName}
          </h2>
          <Button type="submit" disabled={updateMemberMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateMemberMutation.isPending
              ? 'Kaydediliyor...'
              : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="general">
              <User className="mr-2 h-4 w-4" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="health">
              <HeartPulse className="mr-2 h-4 w-4" />
              Rahatsızlıklar
            </TabsTrigger>
            <TabsTrigger value="measurements">
              <Scale className="mr-2 h-4 w-4" />
              Ölçümler
            </TabsTrigger>
            <TabsTrigger value="packages">
              <Package className="mr-2 h-4 w-4" />
              Paketler
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Genel Bilgiler</CardTitle>
                <CardDescription>
                  Üyenin kişisel ve iletişim bilgileri.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Soyad</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input type="email" {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cinsiyet</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kadın">Kadın</SelectItem>
                            <SelectItem value="Erkek">Erkek</SelectItem>
                            <SelectItem value="Diğer">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isVeiled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Tesettür Durumu</FormLabel>
                        <FormDescription>
                          Üyenin tesettürlü olup olmadığını belirtin.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklamalar</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle>Sağlık Durumu</CardTitle>
                <CardDescription>
                  Bilinen rahatsızlıkları ve kısıtlamaları ekleyin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`healthConditions.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="��rn: Bel fıtığı" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeHealth(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => appendHealth({ value: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Yeni Rahatsızlık Ekle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="measurements">
            <Card>
              <CardHeader>
                <CardTitle>Vücut Ölçümleri</CardTitle>
                <CardDescription>Üyenin ilerlemesini takip edin.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Kilo</TableHead>
                      <TableHead>Boy</TableHead>
                      <TableHead>Yağ %</TableHead>
                      <TableHead>Bel</TableHead>
                      <TableHead>Kalça</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurementFields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          {format(parseISO(field.date), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`measurements.${index}.weight`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                className="w-20"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`measurements.${index}.height`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                className="w-20"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`measurements.${index}.bodyFatPercentage`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                className="w-20"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`measurements.${index}.waist`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                className="w-20"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`measurements.${index}.hips`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                className="w-20"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMeasurement(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    appendMeasurement({
                      date: new Date().toISOString(),
                      weight: 0,
                      height: 0,
                      bodyFatPercentage: 0,
                      waist: 0,
                      hips: 0,
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Yeni Ölçüm Ekle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>Paketler</CardTitle>
                <CardDescription>
                  Üyenin mevcut ve geçmiş paketleri.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Paket yönetimi bu ekrandan yapılamamaktadır.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}