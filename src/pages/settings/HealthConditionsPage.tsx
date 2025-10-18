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
import { HealthConditionDefinition } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Edit, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { HealthConditionDialog } from '@/components/HealthConditionDialog'
function HealthConditionsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rahatsızlık Adı</TableHead>
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
export function HealthConditionsPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCondition, setSelectedCondition] =
    useState<HealthConditionDefinition | null>(null)
  const {
    data: conditions,
    isLoading,
    isError,
  } = useQuery<HealthConditionDefinition[]>({
    queryKey: ['health-conditions'],
    queryFn: () => api('/api/settings/health-conditions'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/settings/health-conditions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Rahatsızlık başarıyla silindi.')
      queryClient.invalidateQueries({ queryKey: ['health-conditions'] })
      setIsDeleteDialogOpen(false)
      setSelectedCondition(null)
    },
    onError: (error) => {
      toast.error(`Silme işlemi başarısız: ${error.message}`)
    },
  })
  const handleAddNew = () => {
    setSelectedCondition(null)
    setIsDialogOpen(true)
  }
  const handleEdit = (condition: HealthConditionDefinition) => {
    setSelectedCondition(condition)
    setIsDialogOpen(true)
  }
  const handleDelete = (condition: HealthConditionDefinition) => {
    setSelectedCondition(condition)
    setIsDeleteDialogOpen(true)
  }
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">
              Rahatsızlık Tanımları
            </h2>
            <p className="text-muted-foreground">
              Üye profillerinde seçilebilecek rahatsızlıkları yönetin.
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Ekle
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tanımlı Rahatsızlıklar</CardTitle>
            <CardDescription>
              Sistemde kayıtlı tüm rahatsızlık tanımları.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <HealthConditionsSkeleton />
            ) : isError ? (
              <p>Veriler yüklenirken bir hata oluştu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rahatsızlık Adı</TableHead>
                    <TableHead className="text-right w-[120px]">
                      İşlemler
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conditions?.map((condition) => (
                    <TableRow key={condition.id}>
                      <TableCell className="font-medium">
                        {condition.name}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(condition)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(condition)}
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
      <HealthConditionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        condition={selectedCondition}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedCondition?.name}" tanımını silmek üzeresiniz. Bu işlem
              geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCondition && deleteMutation.mutate(selectedCondition.id)}
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