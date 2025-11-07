import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Staff } from '@shared/types'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Edit, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { StaffDialog } from '@/components/StaffDialog'
function StaffSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>E-posta</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-48" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function StaffManagementPage() {
  const queryClient = useQueryClient()
  const { token, isAuthenticated } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const {
    data: staff,
    isLoading,
    isError,
  } = useQuery<Staff[]>({
    queryKey: ['staff'],
    enabled: !!token && isAuthenticated, // Only run query when authenticated
    queryFn: () => api('/api/staff').then((res: any) => {
      const items = res.data?.items || [];
      // Map backend response to frontend Staff interface
      return items.map((item: any) => ({
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        role: 'uzman', // Default role since backend doesn't have it
        status: item.isActive ? 'active' : 'inactive',
        gender: 'Diğer', // Default gender
        joinDate: item.hireDate,
        hireDate: item.hireDate, // Add for table display
        specializationIds: item.specializationId ? [item.specializationId] : [],
        specializationName: item.specializationName, // Add for table display
        notes: item.notes,
        workingHours: item.workingHours ? JSON.parse(item.workingHours) : [],
        serviceCommissions: [], // Backend doesn't have this
      }));
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/staff/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Personel başarıyla silindi.')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      setIsDeleteDialogOpen(false)
      setSelectedStaff(null)
    },
    onError: (error) => {
      toast.error(`Silme işlemi başarısız: ${error.message}`)
    },
  })
  const handleAddNew = () => {
    setSelectedStaff(null)
    setIsDialogOpen(true)
  }
  const handleEdit = (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    setIsDialogOpen(true)
  }
  const handleDelete = (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    setIsDeleteDialogOpen(true)
  }
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">
              Personel Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Stüdyo personelini ve rollerini yönetin.
            </p>
          </div>
          <Button disabled title="Yakında eklenecek">
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Personel Ekle
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Personel Listesi</CardTitle>
            <CardDescription>
              Sistemde kayıtlı tüm personel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <StaffSkeleton />
            ) : isError ? (
              <p>Veriler yüklenirken bir hata oluştu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Uzmanlık</TableHead>
                    <TableHead>İşe Başlama</TableHead>
                    <TableHead className="text-right w-[120px]">
                      İşlemler
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff?.map((staffMember) => (
                    <TableRow key={staffMember.id}>
                      <TableCell className="font-medium">
                        {staffMember.fullName}
                      </TableCell>
                      <TableCell>{staffMember.email}</TableCell>
                      <TableCell>{staffMember.specializationName || 'Belirtilmemiş'}</TableCell>
                      <TableCell>{new Date(staffMember.hireDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {/* Temporarily disabled edit/delete until StaffDialog is fixed */}
                        <Button
                          variant="outline"
                          size="icon"
                          disabled
                          title="Düzenleme yakında eklenecek"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          disabled
                          title="Silme yakında eklenecek"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <StaffDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        staff={selectedStaff}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedStaff?.fullName}" adlı personeli silmek üzeresiniz. Bu
              işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedStaff && deleteMutation.mutate(selectedStaff.id)
              }
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}