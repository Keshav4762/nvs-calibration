export const toDateOnly = (value) => {
  if (!value) return null

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const getCalibrationDueDate = (calibrationDate) => {
  const date = toDateOnly(calibrationDate)
  if (!date) return ''

  date.setFullYear(date.getFullYear() + 1)
  date.setDate(date.getDate() - 1)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDate = (value) => {
  if (!value) return '—'

  const date = toDateOnly(value)
  if (!date) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const daysBetween = (startValue, endValue) => {
  const start = toDateOnly(startValue)
  const end = toDateOnly(endValue)

  if (!start || !end) return null

  return Math.round((end.getTime() - start.getTime()) / 86400000)
}

export const getDueStatus = (dueDate) => {
  if (!dueDate) {
    return { label: 'UPCOMING', bucket: 'UPCOMING', days: null }
  }

  const today = toDateOnly(new Date())
  const due = toDateOnly(dueDate)

  if (!today || !due) {
    return { label: 'UPCOMING', bucket: 'UPCOMING', days: null }
  }

  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diff < 0) return { label: 'OVERDUE', bucket: 'OVERDUE', days: diff }
  if (diff === 0) return { label: 'DUE TODAY', bucket: 'DUE TODAY', days: 0 }
  if (diff <= 7) return { label: 'DUE IN 7 DAYS', bucket: 'DUE IN 7 DAYS', days: diff }
  if (diff <= 15) return { label: 'DUE IN 15 DAYS', bucket: 'DUE IN 15 DAYS', days: diff }
  if (diff <= 30) return { label: 'DUE IN 30 DAYS', bucket: 'DUE IN 30 DAYS', days: diff }

  return { label: 'UPCOMING', bucket: 'UPCOMING', days: diff }
}

export const getEffectiveDueDate = (cycle, items = []) => {
  const candidateDates = []

  if (cycle?.common_next_due_date) {
    candidateDates.push(cycle.common_next_due_date)
  }

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (item.next_due_date) {
        candidateDates.push(item.next_due_date)
      } else if (cycle?.common_next_due_date) {
        candidateDates.push(cycle.common_next_due_date)
      }
    })
  }

  if (!candidateDates.length) return null

  const validDates = candidateDates.map((date) => toDateOnly(date)).filter(Boolean)
  if (!validDates.length) return null

  const earliest = new Date(Math.min(...validDates.map((date) => date.getTime())))
  const year = earliest.getFullYear()
  const month = String(earliest.getMonth() + 1).padStart(2, '0')
  const day = String(earliest.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getStatusBadgeClasses = (status) => {
  const statusMap = {
    OVERDUE: 'bg-rose-100 text-rose-700 ring-rose-200',
    'DUE TODAY': 'bg-amber-100 text-amber-700 ring-amber-200',
    'DUE IN 7 DAYS': 'bg-orange-100 text-orange-700 ring-orange-200',
    'DUE IN 15 DAYS': 'bg-sky-100 text-sky-700 ring-sky-200',
    'DUE IN 30 DAYS': 'bg-cyan-100 text-cyan-700 ring-cyan-200',
    UPCOMING: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  }

  return statusMap[status] || 'bg-slate-100 text-slate-700 ring-slate-200'
}
