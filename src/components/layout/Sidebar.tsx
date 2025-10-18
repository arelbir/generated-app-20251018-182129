import {
  Users,
  Wallet,
  Settings,
  LayoutDashboard,
  FileText,
  HeartPulse,
  Package,
  Tv,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
const navItems = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    label: 'Üye Yönetimi',
    icon: Users,
    basePath: '/members',
    subItems: [{ to: '/members', label: 'Üyeler' }],
  },
  {
    label: 'Mali Yönetim',
    icon: Wallet,
    basePath: '/financials',
    subItems: [
      { to: '/financials/income', label: 'Aylık Gelir' },
      { to: '/financials/cashbook', label: 'Kasa Defteri' },
    ],
  },
  {
    label: 'Raporlar',
    icon: FileText,
    basePath: '/reports',
    subItems: [
      { to: '/reports/expired-packages', label: 'Biten Paketler' },
      { to: '/reports/audit-log', label: 'İşlem Geçmişi' },
    ],
  },
  {
    label: 'Ayarlar',
    icon: Settings,
    basePath: '/settings',
    subItems: [
      { to: '/settings', label: 'Cihaz Yönetimi', icon: Tv },
      {
        to: '/settings/health-conditions',
        label: 'Rahatsızlıklar',
        icon: HeartPulse,
      },
      { to: '/settings/packages', label: 'Paketler', icon: Package },
      { to: '/settings/staff', label: 'Personel Yönetimi', icon: UsersRound },
      { to: '/settings/specializations', label: 'Uzmanlık Alanları', icon: GraduationCap },
    ],
  },
]
export function SidebarNav({ isCollapsed }: { isCollapsed: boolean }) {
  const location = useLocation()
  const getActiveAccordionItem = () => {
    if (isCollapsed) return []
    const activeItem = navItems.find(
      (item) => item.basePath && location.pathname.startsWith(item.basePath)
    )
    return activeItem ? [activeItem.label] : []
  }
  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-1 px-2">
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={getActiveAccordionItem()}
        >
          {navItems.map((item) =>
            item.subItems ? (
              <AccordionItem
                value={item.label}
                key={item.label}
                className="border-b-0"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AccordionTrigger
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline',
                        isCollapsed && 'justify-center',
                        location.pathname.startsWith(item.basePath!) &&
                          'text-primary bg-accent'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span className="flex-1 text-left">{item.label}</span>
                      )}
                    </AccordionTrigger>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
                <AccordionContent className="pl-8 pb-0">
                  <div className="flex flex-col gap-1 py-1">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        end={subItem.to === '/settings'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            isActive && 'bg-muted text-primary font-semibold'
                          )
                        }
                      >
                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to!}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isActive && 'bg-accent text-primary',
                        isCollapsed && 'justify-center'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && item.label}
                  </NavLink>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            )
          )}
        </Accordion>
      </nav>
    </TooltipProvider>
  )
}
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  return (
    <aside
      className={cn(
        'hidden border-r bg-muted/40 md:flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 relative">
        <NavLink
          to="/"
          className={cn(
            'flex items-center gap-2 font-semibold transition-opacity duration-300',
            isCollapsed && 'opacity-0'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-violet-600"
          >
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M12 2C6.477 2 2 6.477 2 12a10 10 0 0 1 10-10" />
            <path d="M12 22a10 10 0 0 0 10-10" />
            <path d="M22 12a10 10 0 0 1-10 10" />
            <path d="M2 12a10 10 0 0 0 10 10" />
          </svg>
          <span className={cn(isCollapsed && 'hidden')}>MorFit Suite</span>
        </NavLink>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 absolute -right-4 top-1/2 -translate-y-1/2 bg-background border"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex-1 py-2">
        <SidebarNav isCollapsed={isCollapsed} />
      </div>
    </aside>
  )
}