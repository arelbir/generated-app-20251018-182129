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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { MonthlyIncomeRow } from '@shared/types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})
function IncomeTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paket Tarihi</TableHead>
          <TableHead>Müşteri</TableHead>
          <TableHead>Hizmet</TableHead>
          <TableHead>Ücret</TableHead>
          <TableHead>Ödenen</TableHead>
          <TableHead>Kalan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-5 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function MonthlyIncomePage() {
  const {
    data: incomeData,
    isLoading,
    isError,
  } = useQuery<MonthlyIncomeRow[]>({
    queryKey: ['monthlyIncome'],
    queryFn: () => api('/api/financials/income'),
  })
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display">
          Aylık Gelir Tablosu
        </h2>
        <p className="text-muted-foreground">
          Haziran 2025 dönemi gelir raporu.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gelir Raporu</CardTitle>
          <CardDescription>
            Bu ay içinde yapılan paket satışları ve ödemeler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <IncomeTableSkeleton />
          ) : isError ? (
            <p>Gelir verileri yüklenirken bir hata oluştu.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paket Tarihi</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Cihaz/Hizmet</TableHead>
                  <TableHead>Satış Temsilcisi</TableHead>
                  <TableHead className="text-right">Paket Ücreti</TableHead>
                  <TableHead className="text-right">Yapılan Ödeme</TableHead>
                  <TableHead className="text-right">Kalan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeData?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {format(new Date(row.packageDate), 'dd.MM.yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.customerName}
                    </TableCell>
                    <TableCell>{row.service}</TableCell>
                    <TableCell>{row.salesPerson}</TableCell>
                    <TableCell className="text-right">
                      {currencyFormatter.format(row.packageFee)}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {currencyFormatter.format(row.paymentMade)}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.remainingBalance > 0 ? (
                        <Badge variant="destructive">
                          {currencyFormatter.format(row.remainingBalance)}
                        </Badge>
                      ) : (
                        currencyFormatter.format(row.remainingBalance)
                      )}
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