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
import { Member, Package } from '@shared/types'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
interface ExpiredPackageInfo {
  member: Member
  package: Package
}
function ExpiredPackagesSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Üye Adı</TableHead>
          <TableHead>Cihaz</TableHead>
          <TableHead>Paket Bitiş Tarihi</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20 rounded-full" />
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
export function ExpiredPackagesPage() {
  const {
    data: expiredPackages,
    isLoading,
    isError,
  } = useQuery<ExpiredPackageInfo[]>({
    queryKey: ['expiredPackages'],
    queryFn: () => api('/api/reports/expired-packages'),
  })
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display">
          Biten Paketler Raporu
        </h2>
        <p className="text-muted-foreground">
          Süresi dolan veya bitmek üzere olan üye paketleri.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Biten Paketler</CardTitle>
          <CardDescription>
            Toplam {isLoading ? '...' : expiredPackages?.length ?? 0} adet biten
            paket bulundu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ExpiredPackagesSkeleton />
          ) : isError ? (
            <p>Rapor yüklenirken bir hata oluştu.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Üye Ad Soyad</TableHead>
                  <TableHead>Cihaz Türü</TableHead>
                  <TableHead>Paket Bitiş Tarihi</TableHead>
                  <TableHead>Kalan Seans</TableHead>
                  <TableHead>
                    <span className="sr-only">İşlemler</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredPackages?.map(({ member, package: pkg }) => (
                  <TableRow key={`${member.id}-${pkg.id}`}>
                    <TableCell className="font-medium">
                      {member.fullName}
                    </TableCell>
                    <TableCell>{pkg.deviceName}</TableCell>
                    <TableCell>
                      {format(new Date(pkg.endDate), 'dd.MM.yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {pkg.sessionsRemaining}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/members/${member.id}`}>Üyeyi Görüntüle</Link>
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
  )
}