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
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Device } from '@shared/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { EditDeviceDialog } from '@/components/EditDeviceDialog'
import { NewDeviceDialog } from '@/components/NewDeviceDialog'
function DeviceManagementSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cihaz</TableHead>
          <TableHead>Sayı</TableHead>
          <TableHead>Ölçüm Limiti</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 4 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-12" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-48" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function DeviceManagementPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const {
    data: devices,
    isLoading,
    isError,
  } = useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: () => api('/api/settings/devices'),
  })
  const handleEditClick = (device: Device) => {
    setSelectedDevice(device)
    setIsEditDialogOpen(true)
  }
  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">
              Cihaz Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Stüdyodaki ekipmanlar�� yapılandırın ve yönetin.
            </p>
          </div>
          <Button onClick={() => setIsNewDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Cihaz Ekle
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ekipman Listesi</CardTitle>
            <CardDescription>
              Sistemde tanımlı tüm cihazlar ve ayarları.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DeviceManagementSkeleton />
            ) : isError ? (
              <p>Cihazlar yüklenirken bir hata oluştu.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cihaz</TableHead>
                    <TableHead>Sayı</TableHead>
                    <TableHead>Ölçüm Limiti</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices?.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        {device.name}
                      </TableCell>
                      <TableCell>{device.quantity}</TableCell>
                      <TableCell>
                        {device.measurementFrequency
                          ? `${device.measurementFrequency} antrenmanda bir`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            device.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {device.status === 'active' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(device)}
                        >
                          <Edit className="h-4 w-4" />
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
      <EditDeviceDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        device={selectedDevice}
      />
      <NewDeviceDialog
        isOpen={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
      />
    </>
  )
}