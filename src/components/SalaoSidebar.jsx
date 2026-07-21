import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, Scissors, Sparkles,
  Boxes, Wallet, TrendingUp, Landmark, Megaphone, Target, Settings,
  Menu, X, LogOut, User2
} from 'lucide-react'
import { cn } from '../lib/utils'

const navigation = [
  { group: null, items: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard }
  ]},
  { group: 'Operacional', items: [
    { path: '/agendamento', label: 'Agendamento', icon: CalendarDays },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/profissionais', label: 'Profissionais', icon: Scissors },
    { path: '/produtividade', label: 'Produtividade', icon: TrendingUp }
  ]},
  { group: 'Serviços', items: [
    { path: '/servicos', label: 'Precificação', icon: Sparkles },
    { path: '/combos', label: 'Combos', icon: Boxes },
    { path: '/estoque', label: 'Estoque', icon: Boxes }
  ]},
  { group: 'Financeiro', items: [
    { path: '/financeiro', label: 'Caixa & DRE', icon: Wallet },
    { path: '/fpa', label: 'FP&A', icon: TrendingUp },
    { path: '/conciliacao', label: 'Conciliação', icon: Landmark },
    { path: '/comissoes', label: 'Comissões', icon: TrendingUp },
    { path: '/relatorios', label: 'Relatórios', icon: LayoutDashboard }
  ]},
  { group: 'Estratégia', items: [
    { path: '/marketing', label: 'Marketing', icon: Megaphone },
    { path: '/planejamento', label: 'Planejamento', icon: Target }
  ]},
  { group: 'Sistema', items: [
    { path: '/configuracoes', label: 'Configurações', icon: Settings }
  ]}
]

export default function SalaoSidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
        isActive(item.path)
          ? 'bg-[hsl(var(--sidebar-accent))] text-white border border-[hsl(var(--sidebar-accent))]/20'
          : 'text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5 border border-transparent'
      )}
      onClick={() => setMobileOpen(false)}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  )

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E040A0] to-[#9333EA] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">Salão 360</p>
          <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] truncate">
            Gestão Completa
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navigation.map((group, idx) => (
          <div key={idx} className={idx > 0 ? 'mt-4' : ''}>
            {group.group && (
              <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] px-3 mb-2 font-medium">
                {group.group}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(item => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[hsl(var(--sidebar-border))]">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E040A0] to-[#9333EA] flex items-center justify-center shrink-0">
            <User2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-medium text-white truncate">Admin</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">Administrador</p>
          </div>
          <LogOut className="w-4 h-4 text-[hsl(var(--muted-foreground))] hover:text-white shrink-0" />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 h-screen fixed left-0 top-0 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-[hsl(var(--sidebar-bg))] border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-white/5 rounded-lg">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <p className="text-sm font-bold">Salão 360</p>
          <div className="w-9" />
        </div>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="border-t border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))]">
            <nav className="px-3 py-3">
              {navigation.map((group, idx) => (
                <div key={idx} className={idx > 0 ? 'mt-3 pt-3 border-t border-[hsl(var(--sidebar-border))]' : ''}>
                  {group.group && (
                    <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] px-3 mb-2">
                      {group.group}
                    </p>
                  )}
                  <div className="space-y-1">
                    {group.items.map(item => (
                      <NavLink key={item.path} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  )
}
