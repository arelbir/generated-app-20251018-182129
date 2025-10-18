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
import { SpecializationDefinition } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Edit, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SpecializationDialog } from '@/components/SpecializationDialog'
function SpecializationsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Uzmanlık Alanı</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-48" />
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
export function SpecializationsPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSpec, setSelectedSpec] =
    useState<SpecializationDefinition | null>(null)
  const {
    data: specializations,
    isLoading,
    isError,
  } = useQuery<SpecializationDefinition[]>({
    queryKey: ['specializations'],
    queryFn: () => api('/api/settings/specializations'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/settings/specializations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Uzmanlık alanı başarıyla silindi.')
      queryClient.invalidateQueries({ queryKey: ['specializations'] })
      setIsDeleteDialogOpen(false)
      setSelectedSpec(null)
    },
    onError: (error) => {
      toast.error(`Silme işlemi başarısız: ${error.message}`)
    },
  })
  const handleAddNew = () => {
    setSelectedSpec(null)
    setIsDialogOpen(true)
  }
  const handleEdit = (spec: SpecializationDefinition) => {
    setSelectedSpec(spec)
    setIsDialogOpen(true)
  }
  const handleDelete = (spec: SpecializationDefinition) => {
    setSelectedSpec(spec)
    setIsDeleteDialogOpen(true)
  }
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">
              Uzmanlık Alanı Tanımları
            </h2>
            <p className="text-muted-foreground">
              Personel profillerinde seçilebilecek uzmanlık alanlarını yönetin.
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Ekle
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tanımlı Uzmanlık Alanları</CardTitle>
            <CardDescription>
              Sistemde kayıtlı tüm uzmanlık alanı tanımları.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SpecializationsSkeleton />
            ) : isError ? (
              <p>Veriler yüklenirken bir hata oluştu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Uzmanlık Alanı</TableHead>
                    <TableHead className="text-right w-[120px]">
                      İşlemler
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specializations?.map((spec) => (
                    <TableRow key={spec.id}>
                      <TableCell className="font-medium">{spec.name}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(spec)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(spec)}
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
      <SpecializationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        specialization={selectedSpec}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedSpec?.name}" tanımını silmek üzeresiniz. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSpec && deleteMutation.mutate(selectedSpec.id)}
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