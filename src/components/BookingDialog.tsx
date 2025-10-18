import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Member, Session, PaginatedResponse } from '@shared/types'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
interface BookingDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  time: string
  subDeviceId: string
  selectedDate: Date
}
export function BookingDialog({
  isOpen,
  onOpenChange,
  time,
  subDeviceId,
  selectedDate,
}: BookingDialogProps) {
  const queryClient = useQueryClient()
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>()
  const { data: membersData, isLoading: isLoadingMembers } = useQuery<
    PaginatedResponse<Member>
  >({
    queryKey: ['members'],
    queryFn: () => api('/api/members?limit=1000'),
  })
  useEffect(() => {
    if (!isOpen) {
      setSelectedMemberId(undefined)
    }
  }, [isOpen])
  const createSessionMutation = useMutation({
    mutationFn: (newSession: Omit<Session, 'id' | 'status'>) =>
      api<Session>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(newSession),
      }),
    onSuccess: () => {
      toast.success('Seans başarıyla oluşturuldu!')
      queryClient.invalidateQueries({
        queryKey: ['sessions', selectedDate.toISOString().split('T')[0]],
      })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`Seans oluşturulamadı: ${error.message}`)
    },
  })
  const handleSubmit = () => {
    if (!selectedMemberId) {
      toast.warning('Lütfen bir üye seçin.')
      return
    }
    const [hour, minute] = time.split(':')
    const startTime = new Date(selectedDate)
    startTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
    createSessionMutation.mutate({
      memberId: selectedMemberId,
      subDeviceId: subDeviceId,
      startTime: startTime.toISOString(),
      duration: 30,
    })
  }
  const selectedMember = membersData?.items.find(
    (m) => m.id === selectedMemberId
  )
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
          <DialogDescription>
            {subDeviceId} için {time} saatine yeni seans ekleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="member" className="text-right">
              Üye
            </label>
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
              disabled={isLoadingMembers}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Üye seçin..." />
              </SelectTrigger>
              <SelectContent>
                {membersData?.items.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMember && selectedMember.packages.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="package" className="text-right">
                Paket
              </label>
              <Select defaultValue={selectedMember.packages[0].id}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Paket seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedMember.packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.sessionsRemaining} seans kaldı)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createSessionMutation.isPending}
          >
            {createSessionMutation.isPending
              ? 'Kaydediliyor...'
              : 'Randevu Oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}