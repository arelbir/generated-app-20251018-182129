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
import { AuditLog } from '@shared/types'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  FilePlus,
  FileMinus,
  DollarSign,
  Activity,
  UserPlus,
} from 'lucide-react'
const getActionIcon = (action: AuditLog['action']) => {
  switch (action) {
    case 'Seans Ekle':
      return <FilePlus className="h-4 w-4 text-green-500" />
    case 'Seans İptal':
      return <FileMinus className="h-4 w-4 text-red-500" />
    case 'Ödeme Alındı':
      return <DollarSign className="h-4 w-4 text-blue-500" />
    case 'Üye Oluşturuldu':
      return <UserPlus className="h-4 w-4 text-purple-500" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}
function AuditLogSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarih</TableHead>
          <TableHead>Kullanıc��</TableHead>
          <TableHead>İşlem</TableHead>
          <TableHead>Açıklama</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-36" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-28 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function AuditLogPage() {
  const {
    data: auditLogs,
    isLoading,
    isError,
  } = useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: () => api('/api/reports/audit-log'),
  })
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display">
          İşlem Geçmişi
        </h2>
        <p className="text-muted-foreground">
          Sistemde gerçekleştirilen tüm aktivitelerin kaydı.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sistem Aktivite Logları</CardTitle>
          <CardDescription>
            Toplam {isLoading ? '...' : auditLogs?.length ?? 0} işlem kaydı
            bulundu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AuditLogSkeleton />
          ) : isError ? (
            <p>Loglar yüklenirken bir hata oluştu.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Zaman Damgası</TableHead>
                  <TableHead className="w-[150px]">Kullanıcı</TableHead>
                  <TableHead className="w-[180px]">İşlem Türü</TableHead>
                  <TableHead>Açıklama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-2 w-fit">
                        {getActionIcon(log.action)}
                        <span>{log.action}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}