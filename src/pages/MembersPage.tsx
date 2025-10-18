import { File, PlusCircle, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Member, PaginatedResponse } from '@shared/types'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { NewMemberDialog } from '@/components/NewMemberDialog'
import { useAppStore } from '@/stores/useAppStore'
import { toast } from 'sonner'
import { DataTablePagination } from '@/components/ui/data-table-pagination'
function MembersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Kayıt Tarihi</TableHead>
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
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20" />
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
function MembersTable({
  members,
  onConvertToActive,
}: {
  members: Member[]
  onConvertToActive?: (member: Member) => void
}) {
  if (members.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Bu kritere uygun üye bulunamadı.
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad Soyad</TableHead>
          <TableHead className="hidden sm:table-cell">Telefon</TableHead>
          <TableHead className="hidden md:table-cell">Durum</TableHead>
          <TableHead className="hidden lg:table-cell">Kayıt Tarihi</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.fullName}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {member.phone}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge
                variant={member.status === 'active' ? 'default' : 'secondary'}
              >
                {member.status === 'active' ? 'Aktif' : 'Demo'}
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {format(new Date(member.joinDate), 'dd.MM.yyyy')}
            </TableCell>
            <TableCell className="text-right space-x-2">
              {member.status === 'demo' && onConvertToActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConvertToActive(member)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Üye Yap
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to={`/members/${member.id}`}>Detay</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function MembersPage() {
  const searchQuery = useAppStore((state) => state.searchQuery)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('active')
  const [isNewMemberDialogOpen, setIsNewMemberDialogOpen] = useState(false)
  const [memberToConvert, setMemberToConvert] = useState<Member | null>(null)
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const {
    data: membersData,
    isLoading,
    isError,
  } = useQuery<PaginatedResponse<Member>>({
    queryKey: ['members', pageIndex, pageSize],
    queryFn: () => api(`/api/members?page=${pageIndex}&limit=${pageSize}`),
    placeholderData: keepPreviousData,
  })
  const pageCount = membersData
    ? Math.ceil((membersData?.totalCount ?? 0) / pageSize)
    : 0
  const convertMutation = useMutation({
    mutationFn: (member: Member) =>
      api(`/api/members/${member.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'active' }),
      }),
    onSuccess: () => {
      toast.success('Üye başarıyla aktif edildi!')
      queryClient.invalidateQueries({ queryKey: ['members'] })
      setMemberToConvert(null)
    },
    onError: (error) => {
      toast.error(`İşlem başarısız: ${error.message}`)
      setMemberToConvert(null)
    },
  })
  const filteredMembers = useMemo(() => {
    if (!membersData?.items) return { active: [], demo: [] }
    const lowercasedSearch = searchQuery.toLowerCase()
    const filtered = membersData.items.filter((member) =>
      member.fullName.toLowerCase().includes(lowercasedSearch)
    )
    return {
      active: filtered.filter((m) => m.status === 'active'),
      demo: filtered.filter((m) => m.status === 'demo'),
    }
  }, [membersData, searchQuery])
  const exportToCsv = () => {
    const membersToExport =
      activeTab === 'active'
        ? filteredMembers.active
        : filteredMembers.demo
    if (membersToExport.length === 0) return
    const headers = ['ID', 'Ad Soyad', 'Email', 'Telefon', 'Durum', 'Kayıt Tarihi']
    const csvContent = [
      headers.join(','),
      ...membersToExport.map((m) =>
        [
          m.id,
          `"${m.fullName}"`,
          m.email,
          m.phone,
          m.status,
          format(new Date(m.joinDate), 'yyyy-MM-dd'),
        ].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.href) {
      URL.revokeObjectURL(link.href)
    }
    link.href = URL.createObjectURL(blob)
    link.download = `${activeTab}_uyeler_export.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="active">Aktif Üyeler</TabsTrigger>
            <TabsTrigger value="demo">Demo Üyeler</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1"
              onClick={exportToCsv}
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Dışa Aktar
              </span>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1"
              onClick={() => setIsNewMemberDialogOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Yeni Üye
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Aktif Üyeler</CardTitle>
              <CardDescription>
                Stüdyonun mevcut aktif üyelerinin listesi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !membersData ? (
                <MembersTableSkeleton />
              ) : isError ? (
                <p>Üyeler yüklenirken bir hata oluştu.</p>
              ) : (
                <MembersTable members={filteredMembers.active} />
              )}
            </CardContent>
            <CardFooter>
              {membersData && (
                <DataTablePagination
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  totalCount={membersData?.totalCount ?? 0}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
                  onPageSizeChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
                  pageCount={pageCount}
                />
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="demo">
          <Card>
            <CardHeader>
              <CardTitle>Demo Üyeler</CardTitle>
              <CardDescription>
                Deneme sürecindeki potansiyel üyeler.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !membersData ? (
                <MembersTableSkeleton />
              ) : isError ? (
                <p>Üyeler yüklenirken bir hata oluştu.</p>
              ) : (
                <MembersTable
                  members={filteredMembers.demo}
                  onConvertToActive={setMemberToConvert}
                />
              )}
            </CardContent>
            <CardFooter>
              {membersData && (
                 <DataTablePagination
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  totalCount={membersData?.totalCount ?? 0}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
                  onPageSizeChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
                  pageCount={pageCount}
                />
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <NewMemberDialog
        isOpen={isNewMemberDialogOpen}
        onOpenChange={setIsNewMemberDialogOpen}
      />
      <AlertDialog
        open={!!memberToConvert}
        onOpenChange={() => setMemberToConvert(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Üyeliği Aktif Et</AlertDialogTitle>
            <AlertDialogDescription>
              "{memberToConvert?.fullName}" adlı demo üyeyi aktif üye yapmak
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToConvert && convertMutation.mutate(memberToConvert)}
              disabled={convertMutation.isPending}
            >
              {convertMutation.isPending ? 'İşleniyor...' : 'Onayla ve Aktif Et'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}