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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { Member, Session } from '@shared/types'
import { useQuery } from '@tanstack/react-query'
import {
  FileDown,
  Mail,
  Phone,
  User,
  HeartPulse,
  Scale,
  Package,
  Calendar,
  Edit,
} from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <Tabs defaultValue="general">
        <TabsList>
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </TabsList>
        <Card className="mt-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>()
  const {
    data: member,
    isLoading: isLoadingMember,
    isError: isErrorMember,
  } = useQuery<Member>({
    queryKey: ['member', id],
    queryFn: () => api(`/api/members/${id}`),
    enabled: !!id,
  })
  const {
    data: sessions,
    isLoading: isLoadingSessions,
  } = useQuery<Session[]>({
    queryKey: ['sessions', id],
    queryFn: () => api(`/api/sessions?memberId=${id}`),
    enabled: !!id,
  })
  if (isLoadingMember) {
    return <ProfileSkeleton />
  }
  if (isErrorMember || !member) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Üye Bulunamadı</h2>
        <p className="text-muted-foreground">
          Bu ID'ye sahip bir üye bulunamadı veya bir hata oluştu.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">
              {member.fullName}
            </h2>
            <p className="text-muted-foreground">
              Üye No: {member.id.slice(0, 8)}
            </p>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> {member.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> {member.email}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to={`/members/${member.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            PDF Olarak Aktar
          </Button>
        </div>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="general">
            <User className="mr-2 h-4 w-4" /> Genel
          </TabsTrigger>
          <TabsTrigger value="health">
            <HeartPulse className="mr-2 h-4 w-4" /> Rahatsızlıklar
          </TabsTrigger>
          <TabsTrigger value="measurements">
            <Scale className="mr-2 h-4 w-4" /> Ölçümler
          </TabsTrigger>
          <TabsTrigger value="packages">
            <Package className="mr-2 h-4 w-4" /> Paketler
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Calendar className="mr-2 h-4 w-4" /> Randevular
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-muted-foreground">
                    Cinsiyet
                  </span>
                  <span>{member.gender}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-muted-foreground">
                    Tesettür Durumu
                  </span>
                  <span>{member.isVeiled ? 'Evet' : 'Hay��r'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-muted-foreground">
                    Kayıt Tarihi
                  </span>
                  <span>{format(new Date(member.joinDate), 'dd.MM.yyyy')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-muted-foreground">
                    Durum
                  </span>
                  <Badge
                    variant={member.status === 'active' ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {member.status === 'active' ? 'Aktif Üye' : 'Demo Üye'}
                  </Badge>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <span className="font-medium text-muted-foreground">
                    Açıklamalar
                  </span>
                  <p className="pt-1">{member.notes || 'Açıklama yok.'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Sağlık Durumu ve Kısıtlamalar</CardTitle>
            </CardHeader>
            <CardContent>
              {member.healthConditions?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {member.healthConditions.map((condition, i) => (
                    <li key={i}>{condition}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Belirtilen bir rahatsızlık yok.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle>Vücut Ölçümleri</CardTitle>
              <CardDescription>
                Üyenin ilerlemesini takip edin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kilo (kg)</TableHead>
                    <TableHead>Boy (cm)</TableHead>
                    <TableHead>Yağ Oranı (%)</TableHead>
                    <TableHead>Bel (cm)</TableHead>
                    <TableHead>Kalça (cm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.measurements?.length > 0 ? (
                    member.measurements.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {format(new Date(m.date), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell>{m.weight}</TableCell>
                        <TableCell>{m.height}</TableCell>
                        <TableCell>{m.bodyFatPercentage}</TableCell>
                        <TableCell>{m.waist}</TableCell>
                        <TableCell>{m.hips}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Henüz ölçüm girilmemiş.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <CardTitle>Aktif Paketler</CardTitle>
              <CardDescription>
                Üyenin mevcut ve geçmiş paketleri.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cihaz</TableHead>
                    <TableHead>Paket Adı</TableHead>
                    <TableHead>Başlangıç Tarihi</TableHead>
                    <TableHead>Bitiş Tarihi</TableHead>
                    <TableHead>Kalan Seans</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.packages?.length > 0 ? (
                    member.packages.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{p.deviceName}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>
                          {format(new Date(p.startDate), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(p.endDate), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell>{p.sessionsRemaining}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              new Date(p.endDate) > new Date()
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {new Date(p.endDate) > new Date()
                              ? 'Aktif'
                              : 'Bitti'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Aktif paket bulunmuyor.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Randevular</CardTitle>
              <CardDescription>Geçmiş ve gelecek randevular.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Saat</TableHead>
                      <TableHead>Cihaz</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions && sessions.length > 0 ? (
                      sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{format(new Date(session.startTime), 'dd.MM.yyyy')}</TableCell>
                          <TableCell>{format(new Date(session.startTime), 'HH:mm')}</TableCell>
                          <TableCell>{session.subDeviceId}</TableCell>
                          <TableCell>
                            <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>{session.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Bu üyeye ait randevu bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}