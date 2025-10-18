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
import { PackageDefinition } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Edit, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PackageDialog } from '@/components/PackageDialog'
const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})
function PackagesSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paket Adı</TableHead>
          <TableHead>Cihaz</TableHead>
          <TableHead>Seans</TableHead>
          <TableHead>Ücret</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-48" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
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
export function PackagesPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] =
    useState<PackageDefinition | null>(null)
  const {
    data: packages,
    isLoading,
    isError,
  } = useQuery<PackageDefinition[]>({
    queryKey: ['package-definitions'],
    queryFn: () => api('/api/settings/packages'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/settings/packages/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Paket başarıyla silindi.')
      queryClient.invalidateQueries({ queryKey: ['package-definitions'] })
      setIsDeleteDialogOpen(false)
      setSelectedPackage(null)
    },
    onError: (error) => {
      toast.error(`Silme işlemi başarısız: ${error.message}`)
    },
  })
  const handleAddNew = () => {
    setSelectedPackage(null)
    setIsDialogOpen(true)
  }
  const handleEdit = (pkg: PackageDefinition) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }
  const handleDelete = (pkg: PackageDefinition) => {
    setSelectedPackage(pkg)
    setIsDeleteDialogOpen(true)
  }
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">
              Paket Tanımları
            </h2>
            <p className="text-muted-foreground">
              Stüdyoda satılan hizmet paketlerini yönetin.
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Paket Ekle
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tanımlı Paketler</CardTitle>
            <CardDescription>
              Sistemde kayıtlı tüm paket tanımları.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PackagesSkeleton />
            ) : isError ? (
              <p>Veriler yüklenirken bir hata oluştu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paket Adı</TableHead>
                    <TableHead>Cihaz</TableHead>
                    <TableHead>Seans Sayısı</TableHead>
                    <TableHead>Geçerlilik (Gün)</TableHead>
                    <TableHead>Ücret</TableHead>
                    <TableHead className="text-right w-[120px]">
                      İşlemler
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages?.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.deviceName}</TableCell>
                      <TableCell>{pkg.totalSessions}</TableCell>
                      <TableCell>{pkg.durationDays}</TableCell>
                      <TableCell>{currencyFormatter.format(pkg.price)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(pkg)}
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
      <PackageDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pkg={selectedPackage}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedPackage?.name}" paketini silmek üzeresiniz. Bu işlem
              geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPackage && deleteMutation.mutate(selectedPackage.id)}
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