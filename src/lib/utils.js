import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
export const monthNamesFull = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function fmtCurrency(value) {
  if (typeof value !== 'number') return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function fmtNumber(value, decimals = 0) {
  if (typeof value !== 'number') return '0'
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value)
}

export function fmtPercent(value, decimals = 1) {
  if (typeof value !== 'number') return '0%'
  return fmtNumber(value, decimals) + '%'
}

export function fmtDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

export function fmtDateTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  const dateStr = d.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' })
  const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dateStr} ${timeStr}`
}

export function fmtTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function getMonthKey(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getMonthLabel(date) {
  const d = new Date(date)
  const month = monthNamesFull[d.getMonth()]
  const year = d.getFullYear()
  return `${month}/${year}`
}

export function todayISO() {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  const da = new Date(a)
  const db = new Date(b)
  return da.toDateString() === db.toDateString()
}

export function startOfMonth(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export function calcROI(revenue, investment) {
  if (!investment || investment === 0) return 0
  return ((revenue - investment) / investment) * 100
}

export function calcCAC(investment, clients) {
  if (!clients || clients === 0) return 0
  return investment / clients
}

export function calcLTV(ticketMedio, frequencia, months) {
  return ticketMedio * frequencia * months
}

export function calcPayback(cac, ticketMedio, margin) {
  if (!ticketMedio || !margin || margin === 0) return 0
  return cac / (ticketMedio * (margin / 100))
}

export function calcMargin(priceVenda, custoProduto) {
  if (!priceVenda || priceVenda === 0) return 0
  return ((priceVenda - custoProduto) / priceVenda) * 100
}

export function monthLabels(count = 6) {
  const labels = []
  const today = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    labels.push({
      key: getMonthKey(d),
      label: monthNames[d.getMonth()]
    })
  }
  return labels
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}
