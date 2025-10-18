import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Check, HelpCircle, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Session, Member, Device } from '@shared/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BookingDialog } from '@/components/BookingDialog'
import { format, addDays, subDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
const timeSlots = Array.from({ length: 30 }, (_, i) => {
  const hour = 8 + Math.floor((i + 1) / 2)
  const minute = (i + 1) % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})
interface EnrichedSession extends Session {
  member?: Member
}
const SessionCard: React.FC<{ session: EnrichedSession }> = ({ session }) => {
  const baseClasses =
    'p-1.5 text-xs rounded-md w-full h-full flex flex-col justify-between text-left transition-all duration-200'
  const statusClasses = {
    booked:
      'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/60',
    confirmed:
      'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-200 border border-green-200 dark:border-green-800/60',
    completed:
      'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-200 border border-green-200 dark:border-green-800/60 opacity-70',
    cancelled:
      'bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800/60 line-through',
  }
  return (
    <div className={cn(baseClasses, statusClasses[session.status])}>
      <div className="flex justify-between items-start">
        <span className="font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
          {session.member?.fullName}
        </span>
        <div className="flex items-center space-x-1 flex-shrink-0">
          {session.status === 'booked' && (
            <HelpCircle className="h-3 w-3 text-blue-500" />
          )}
          {session.status === 'completed' && (
            <Check className="h-3 w-3 text-green-600" />
          )}
        </div>
      </div>
    </div>
  )
}
function DashboardSkeleton() {
  const placeholderDeviceCount = 6
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[auto,1fr] gap-x-4">
          <div className="flex flex-col">
            <div className="h-10"></div>
            {timeSlots.map((time) => (
              <div key={time} className="h-16 flex items-center justify-center">
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${placeholderDeviceCount}, minmax(140px, 1fr))`,
              }}
            >
              {Array.from({ length: placeholderDeviceCount }).map((_, i) => (
                <div
                  key={`device-skel-${i}`}
                  className="h-10 flex items-center justify-center"
                >
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
              {timeSlots.map((time) =>
                Array.from({ length: placeholderDeviceCount }).map((_, i) => (
                  <div
                    key={`${time}-skel-${i}`}
                    className="h-16 border-t border-l p-1"
                  >
                    <Skeleton className="h-full w-full rounded-md" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookingInfo, setBookingInfo] = useState<{
    isOpen: boolean
    time: string
    subDeviceId: string
  }>({ isOpen: false, time: '', subDeviceId: '' })
  const dateQueryParam = format(selectedDate, 'yyyy-MM-dd')
  const { data: sessions, isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: ['sessions', dateQueryParam],
    queryFn: () => api(`/api/sessions?date=${dateQueryParam}`),
  })
  const { data: membersData, isLoading: isLoadingMembers } = useQuery<{
    items: Member[]
  }>({
    queryKey: ['members'],
    queryFn: () => api('/api/members?limit=1000'),
  })
  const { data: devices, isLoading: isLoadingDevices } = useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: () => api('/api/settings/devices'),
  })
  const membersById = useMemo(() => {
    if (!membersData?.items) return new Map()
    return new Map(membersData.items.map((m) => [m.id, m]))
  }, [membersData])
  const enrichedSessions = useMemo(() => {
    if (!sessions) return []
    return sessions.map((session) => ({
      ...session,
      member: membersById.get(session.memberId),
    }))
  }, [sessions, membersById])
  const sessionsBySlot = useMemo(() => {
    const map = new Map<string, EnrichedSession>()
    enrichedSessions.forEach((session) => {
      const date = new Date(session.startTime)
      const time = `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
      const key = `${time}-${session.subDeviceId}`
      map.set(key, session)
    })
    return map
  }, [enrichedSessions])
  const handleCellClick = (time: string, subDeviceId: string) => {
    if (!sessionsBySlot.has(`${time}-${subDeviceId}`)) {
      setBookingInfo({ isOpen: true, time, subDeviceId })
    }
  }
  const isLoading = isLoadingSessions || isLoadingMembers || isLoadingDevices
  const allSubDevices = useMemo(() => devices?.flatMap(d => d.subDevices) ?? [], [devices]);
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">
            Seans Yönetimi
          </h2>
          <p className="text-muted-foreground">
            Seans takvimini görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => setBookingInfo({ isOpen: true, time: '09:00', subDeviceId: allSubDevices[0]?.name || '' })}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Randevu
          </Button>
        </div>
      </div>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Seans Takvimi</CardTitle>
            <CardDescription>
              {
                enrichedSessions.filter((s) => s.status === 'booked').length
              }{' '}
              adet işaretlenmemiş seans bulunmaktadır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[auto,1fr] gap-x-4">
              <div className="flex flex-col">
                <div className="h-10"></div> {/* Header offset */}
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-16 flex items-center justify-center text-sm font-medium text-muted-foreground"
                  >
                    {time}
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${allSubDevices.length}, minmax(140px, 1fr))`,
                  }}
                >
                  {allSubDevices.map((subDevice) => (
                    <div
                      key={subDevice.id}
                      className="h-10 flex items-center justify-center font-semibold text-sm sticky top-0 bg-background/95 backdrop-blur-sm z-10"
                    >
                      {subDevice.name}
                    </div>
                  ))}
                  {timeSlots.map((time) =>
                    allSubDevices.map((subDevice) => {
                      const sessionKey = `${time}-${subDevice.name}`
                      const session = sessionsBySlot.get(sessionKey)
                      return (
                        <div
                          key={sessionKey}
                          className="h-16 border-t border-l p-1 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleCellClick(time, subDevice.name)}
                        >
                          {session && <SessionCard session={session} />}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <BookingDialog
        isOpen={bookingInfo.isOpen}
        onOpenChange={(isOpen) => setBookingInfo({ ...bookingInfo, isOpen })}
        time={bookingInfo.time}
        subDeviceId={bookingInfo.subDeviceId}
        selectedDate={selectedDate}
      />
    </div>
  )
}