import { Fragment, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import { formatDate, getCalibrationDueDate, getDueStatus, getEffectiveDueDate, getStatusBadgeClasses } from './lib/dateUtils'
import { getSupabaseErrorMessage, isSupabaseConfigured, supabase } from './lib/supabase'

const createEmptyInstrument = () => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  instrument_name: '',
  make: '',
  model: '',
  serial_number: '',
  instrument_range: '',
  next_due_date: '',
  remarks: '',
})

function SetupGuide() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">Supabase connection required</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add the environment variables from <span className="font-semibold">.env.example</span> to a local
          <span className="font-semibold"> .env </span> file and run the SQL migration before launching the app.
        </p>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-slate-700">
          <li>Copy .env.example to .env</li>
          <li>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
          <li>Run the migration in Supabase SQL Editor</li>
          <li>Enable Email authentication in Supabase Auth</li>
        </ol>
      </div>
    </div>
  )
}

function LoginPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) return

    try {
      setLoading(true)
      setError('')

      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        return
      }

      onAuthSuccess()
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Secure Access</p>
            <h1 className="text-2xl font-semibold text-slate-900">Calibra</h1>
          </div>
        </div>

        <div className="mb-5 inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
              placeholder="office@lab.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AppShell({ onSignOut }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar onSignOut={onSignOut} />
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

function DashboardPage() {
  const [customers, setCustomers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [customerFilter, setCustomerFilter] = useState('ALL')
  const [dueDateFilter, setDueDateFilter] = useState('ALL')

  const handleExportCsv = () => {
    const rows = schedules.filter((schedule) => {
      const matchesCustomer = customerFilter === 'ALL' || schedule.customer_id === customerFilter
      const matchesStatus = statusFilter === 'ALL' || schedule.dueState?.bucket === statusFilter
      const matchesDueDate =
        dueDateFilter === 'ALL' ||
        (dueDateFilter === 'OVERDUE' && schedule.dueState?.label === 'OVERDUE') ||
        (dueDateFilter === 'NEXT_7_DAYS' && ['DUE TODAY', 'DUE IN 7 DAYS'].includes(schedule.dueState?.label)) ||
        (dueDateFilter === 'NEXT_15_DAYS' && ['DUE TODAY', 'DUE IN 7 DAYS', 'DUE IN 15 DAYS'].includes(schedule.dueState?.label)) ||
        (dueDateFilter === 'NEXT_30_DAYS' && ['DUE TODAY', 'DUE IN 7 DAYS', 'DUE IN 15 DAYS', 'DUE IN 30 DAYS'].includes(schedule.dueState?.label))

      return matchesCustomer && matchesStatus && matchesDueDate
    })

    const csvRows = [
      ['Customer', 'Schedule Name', 'Reference', 'Latest Cycle', 'Due Date Mode', 'Next Due Date', 'Status'],
      ...rows.map((schedule) => [
        schedule.customer?.company_name || '',
        schedule.schedule_name,
        schedule.schedule_reference || '',
        schedule.latestCycle ? `${schedule.latestCycle.cycle_number || ''}` : '',
        schedule.latestCycle?.due_date_mode || 'COMMON',
        formatDate(schedule.dueDate),
        schedule.dueState?.label || 'UPCOMING',
      ]),
    ]

    const csvContent = csvRows
      .map((values) => values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'calibration-schedule-export.csv'
    link.click()
  }

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) return

      try {
        setLoading(true)

        const [customerResult, schedulesResult, cyclesResult, itemsResult] = await Promise.all([
          supabase.from('customers').select('*').order('company_name'),
          supabase.from('calibration_schedules').select('*').eq('is_active', true).order('created_at', { ascending: false }),
          supabase.from('calibration_cycles').select('*').order('created_at', { ascending: false }),
          supabase.from('calibration_cycle_items').select('*'),
        ])

        const customerList = customerResult.data || []
        const scheduleList = schedulesResult.data || []
        const cycleList = cyclesResult.data || []
        const itemList = itemsResult.data || []

        const scheduleRows = scheduleList.map((schedule) => {
          const scheduleCycles = cycleList
            .filter((cycle) => cycle.schedule_id === schedule.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

          const latestCycle = scheduleCycles[0] || null
          const itemsForCycle = latestCycle ? itemList.filter((item) => item.cycle_id === latestCycle.id) : []
          const dueDate = latestCycle ? getEffectiveDueDate(latestCycle, itemsForCycle) : null
          const dueState = dueDate ? getDueStatus(dueDate) : { label: 'UPCOMING', bucket: 'UPCOMING', days: null }

          return {
            ...schedule,
            customer: customerList.find((customer) => customer.id === schedule.customer_id),
            latestCycle,
            itemsForCycle,
            dueDate,
            dueState,
            totalInstruments: latestCycle?.total_instruments ?? itemsForCycle.length ?? 0,
          }
        })

        setCustomers(customerList)
        setSchedules(scheduleRows)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const summaryCards = [
    { label: 'Total Customers', value: customers.length, icon: UserCheck, accent: 'cyan' },
    { label: 'Active Calibration Schedules', value: schedules.length, icon: CalendarDays, accent: 'emerald' },
    {
      label: 'Total Instruments',
      value: schedules.reduce((sum, schedule) => sum + Number(schedule.totalInstruments || 0), 0),
      icon: BarChart3,
      accent: 'violet',
    },
    {
      label: 'Overdue Schedules',
      value: schedules.filter((schedule) => schedule.dueState?.label === 'OVERDUE').length,
      icon: AlertTriangle,
      accent: 'rose',
    },
    {
      label: 'Due Today',
      value: schedules.filter((schedule) => schedule.dueState?.label === 'DUE TODAY').length,
      icon: CheckCircle2,
      accent: 'amber',
    },
    {
      label: 'Due Within 7 Days',
      value: schedules.filter((schedule) => schedule.dueState?.label === 'DUE IN 7 DAYS').length,
      icon: Clock3,
      accent: 'amber',
    },
    {
      label: 'Due Within 15 Days',
      value: schedules.filter((schedule) => schedule.dueState?.label === 'DUE IN 15 DAYS').length,
      icon: TrendingUp,
      accent: 'cyan',
    },
    {
      label: 'Due Within 30 Days',
      value: schedules.filter((schedule) => schedule.dueState?.label === 'DUE IN 30 DAYS').length,
      icon: ArrowRight,
      accent: 'slate',
    },
  ]

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesCustomer = customerFilter === 'ALL' || schedule.customer_id === customerFilter
    const matchesStatus = statusFilter === 'ALL' || schedule.dueState?.bucket === statusFilter
    const matchesDueDate =
      dueDateFilter === 'ALL' ||
      (dueDateFilter === 'OVERDUE' && schedule.dueState?.label === 'OVERDUE') ||
      (dueDateFilter === 'NEXT_7_DAYS' && ['DUE TODAY', 'DUE IN 7 DAYS'].includes(schedule.dueState?.label)) ||
      (dueDateFilter === 'NEXT_15_DAYS' && ['DUE TODAY', 'DUE IN 7 DAYS', 'DUE IN 15 DAYS'].includes(schedule.dueState?.label)) ||
      (dueDateFilter === 'NEXT_30_DAYS' && ['DUE TODAY', 'DUE IN 7 DAYS', 'DUE IN 15 DAYS', 'DUE IN 30 DAYS'].includes(schedule.dueState?.label))

    return matchesCustomer && matchesStatus && matchesDueDate
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Calibration dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={customerFilter}
            onChange={(event) => setCustomerFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500"
          >
            <option value="ALL">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.company_name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500"
          >
            <option value="ALL">All statuses</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DUE TODAY">Due today</option>
            <option value="DUE IN 7 DAYS">Due in 7 days</option>
            <option value="DUE IN 15 DAYS">Due in 15 days</option>
            <option value="DUE IN 30 DAYS">Due in 30 days</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
          <select
            value={dueDateFilter}
            onChange={(event) => setDueDateFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500"
          >
            <option value="ALL">All due dates</option>
            <option value="OVERDUE">Overdue only</option>
            <option value="NEXT_7_DAYS">Due in next 7 days</option>
            <option value="NEXT_15_DAYS">Due in next 15 days</option>
            <option value="NEXT_30_DAYS">Due in next 30 days</option>
          </select>
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} accent={card.accent} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active calibration schedules</h2>
            <span className="text-sm text-slate-500">{filteredSchedules.length} records</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading schedules...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer Name</th>
                  <th className="px-4 py-3 font-medium">Schedule Reference</th>
                  <th className="px-4 py-3 font-medium">Latest Cycle</th>
                  <th className="px-4 py-3 font-medium">Total Instruments</th>
                  <th className="px-4 py-3 font-medium">Due Date Mode</th>
                  <th className="px-4 py-3 font-medium">Last Calibration Date</th>
                  <th className="px-4 py-3 font-medium">Next Due Date</th>
                  <th className="px-4 py-3 font-medium">Days Remaining</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <Fragment key={schedule.id}>
                    <tr className="border-t border-slate-200 align-top">
                      <td className="px-4 py-3">{schedule.customer?.company_name || '—'}</td>
                      <td className="px-4 py-3">{schedule.schedule_reference || schedule.schedule_name}</td>
                      <td className="px-4 py-3">
                        {schedule.latestCycle ? `${schedule.latestCycle.cycle_number || 'Cycle'} / ${schedule.latestCycle.job_reference || '—'}` : 'No cycle'}
                      </td>
                      <td className="px-4 py-3">{schedule.totalInstruments || 0}</td>
                      <td className="px-4 py-3">{schedule.latestCycle?.due_date_mode || 'COMMON'}</td>
                      <td className="px-4 py-3">{formatDate(schedule.latestCycle?.calibration_date)}</td>
                      <td className="px-4 py-3">{formatDate(schedule.dueDate)}</td>
                      <td className="px-4 py-3">{schedule.dueState?.days ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClasses(schedule.dueState?.label || 'UPCOMING')}`}>
                          {schedule.dueState?.label || 'UPCOMING'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === schedule.id ? null : schedule.id)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:border-slate-300"
                        >
                          {expandedId === schedule.id ? 'Hide details' : 'View items'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === schedule.id ? (
                      <tr>
                        <td colSpan="10" className="bg-slate-50 px-4 py-4">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-slate-900">Instrument-level due dates</h3>
                              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                {schedule.latestCycle?.due_date_mode || 'COMMON'}
                              </span>
                            </div>
                            {schedule.itemsForCycle.length ? (
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {schedule.itemsForCycle.map((item) => {
                                  const itemStatus = getDueStatus(item.next_due_date || schedule.latestCycle?.common_next_due_date)

                                  return (
                                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="font-medium text-slate-800">{item.instrument_name}</p>
                                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${getStatusBadgeClasses(itemStatus.label)}`}>
                                          {itemStatus.label}
                                        </span>
                                      </div>
                                      <p className="mt-2 text-xs text-slate-500">{item.make || 'Make not specified'} / {item.model || 'Model not specified'}</p>
                                      <p className="mt-2 text-xs">Due: {formatDate(item.next_due_date || schedule.latestCycle?.common_next_due_date)}</p>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">No instrument records for this cycle. Use the common due date for the full schedule.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const emptyCustomerForm = {
  id: '',
  company_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  gst_number: '',
}

function AddCustomerPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({
    ...emptyCustomerForm,
    ...(location.state?.customer || {}),
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) return

    try {
      setSaving(true)
      setError('')

      const payload = {
        company_name: form.company_name,
        contact_person: form.contact_person,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        gst_number: form.gst_number,
      }

      if (form.id) {
        const { error } = await supabase.from('customers').update(payload).eq('id', form.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('customers').insert(payload)
        if (error) throw error
      }

      navigate('/customers/directory')
    } catch (submissionError) {
      setError(getSupabaseErrorMessage(submissionError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Customers</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">{form.id ? 'Edit customer' : 'Add customer'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Customer Name</label>
            <input
              value={form.company_name}
              onChange={(event) => handleChange('company_name', event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Contact Person</label>
            <input value={form.contact_person} onChange={(event) => handleChange('contact_person', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
            <input value={form.city} onChange={(event) => handleChange('city', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">GST Number</label>
            <input value={form.gst_number} onChange={(event) => handleChange('gst_number', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
            <textarea value={form.address} onChange={(event) => handleChange('address', event.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
          </div>

          {error ? <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

          <div className="md:col-span-2 xl:col-span-3 flex gap-3">
            <button type="submit" disabled={saving} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-60">
              {saving ? 'Saving...' : form.id ? 'Update customer' : 'Add customer'}
            </button>
            {form.id ? (
              <button type="button" onClick={() => navigate('/customers/directory')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}

function CustomerDirectoryPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingCustomerId, setDeletingCustomerId] = useState('')

  useEffect(() => {
    const loadCustomers = async () => {
      if (!supabase) return
      const { data, error: loadError } = await supabase.from('customers').select('*').order('company_name')
      if (loadError) setError(getSupabaseErrorMessage(loadError))
      else setCustomers(data || [])
      setLoading(false)
    }

    loadCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const searchText = query.toLowerCase()
    return (
      !searchText ||
      customer.company_name?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText) ||
      customer.gst_number?.toLowerCase().includes(searchText)
    )
  })

  const handleDeleteCustomer = async (customer) => {
    const confirmed = window.confirm(
      `Delete ${customer.company_name}? This will also permanently delete its calibration schedules and related cycle records.`,
    )
    if (!confirmed || !supabase) return

    try {
      setDeletingCustomerId(customer.id)
      setError('')
      const { error: deleteError } = await supabase.from('customers').delete().eq('id', customer.id)
      if (deleteError) throw deleteError
      setCustomers((current) => current.filter((entry) => entry.id !== customer.id))
    } catch (deleteError) {
      setError(getSupabaseErrorMessage(deleteError))
    } finally {
      setDeletingCustomerId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Customers</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Customer directory</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-72 max-w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-cyan-500"
                placeholder="Search company, phone or GST"
                aria-label="Search customers"
              />
            </div>
            <button type="button" onClick={() => navigate('/customers/add')} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500">
              <Plus className="h-4 w-4" />
              Add customer
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        {error ? <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">GST</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{customer.company_name}</td>
                    <td className="px-4 py-3">{customer.contact_person || '—'}</td>
                    <td className="px-4 py-3">{customer.phone || '—'}</td>
                    <td className="px-4 py-3">{customer.email || '—'}</td>
                    <td className="px-4 py-3">{customer.gst_number || '—'}</td>
                    <td className="px-4 py-3">{customer.city || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/customers/add', { state: { customer } })}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:border-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomer(customer)}
                        disabled={deletingCustomerId === customer.id}
                        aria-label={`Delete ${customer.company_name}`}
                        title="Delete customer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredCustomers.length ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">No customers found.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function AddSchedulePage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [scheduleName, setScheduleName] = useState('')
  const [scheduleReference, setScheduleReference] = useState('')
  const [description, setDescription] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [cycleNumber, setCycleNumber] = useState('1')
  const [jobReference, setJobReference] = useState('')
  const [calibrationDate, setCalibrationDate] = useState('')
  const [commonNextDueDate, setCommonNextDueDate] = useState('')
  const [totalInstruments, setTotalInstruments] = useState('0')
  const [dueDateMode, setDueDateMode] = useState('COMMON')
  const [status, setStatus] = useState('PENDING')
  const [remarks, setRemarks] = useState('')
  const [instrumentRows, setInstrumentRows] = useState([createEmptyInstrument()])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    if (!supabase) return

    const customerResult = await supabase.from('customers').select('*').order('company_name')
    setCustomers(customerResult.data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateInstrumentRow = (index, field, value) => {
    setInstrumentRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    )
  }

  const addInstrumentRow = () => {
    setInstrumentRows((current) => [...current, createEmptyInstrument()])
  }

  const removeInstrumentRow = (index) => {
    setInstrumentRows((current) => current.filter((_, rowIndex) => rowIndex !== index))
  }

  const validateScheduleDraft = () => {
    if (!customerId || !scheduleName.trim()) {
      return 'Please select a customer and enter a schedule name.'
    }

    const validInstrumentRows = instrumentRows.filter((row) => row.instrument_name.trim())

    if (dueDateMode === 'COMMON' && !commonNextDueDate) {
      return 'COMMON mode requires a common next due date.'
    }

    if (dueDateMode === 'INDIVIDUAL') {
      if (!validInstrumentRows.length) {
        return 'INDIVIDUAL mode requires at least one instrument with a due date.'
      }

      const invalidInstrument = validInstrumentRows.some((row) => !row.next_due_date)
      if (invalidInstrument) {
        return 'Every instrument in INDIVIDUAL mode must have its own next due date.'
      }
    }

    if (dueDateMode === 'MIXED') {
      if (!commonNextDueDate && !validInstrumentRows.some((row) => row.next_due_date)) {
        return 'MIXED mode requires a common next due date or at least one instrument due date.'
      }
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) return

    try {
      setSaving(true)
      setMessage('')

      const validationError = validateScheduleDraft()
      if (validationError) {
        setMessage(validationError)
        return
      }

      const schedulePayload = {
        customer_id: customerId,
        schedule_name: scheduleName,
        schedule_reference: scheduleReference,
        description,
        is_active: true,
      }

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('calibration_schedules')
        .insert(schedulePayload)
        .select()
        .single()

      if (scheduleError) throw scheduleError

      const { data: cycleData, error: cycleError } = await supabase
        .from('calibration_cycles')
        .insert({
          schedule_id: scheduleData.id,
          cycle_number: Number(cycleNumber || 1),
          job_reference: jobReference,
          calibration_date: calibrationDate || null,
          total_instruments: Number(totalInstruments || instrumentRows.length || 0),
          due_date_mode: dueDateMode,
          common_next_due_date: commonNextDueDate || null,
          status,
          remarks,
        })
        .select()
        .single()

      if (cycleError) throw cycleError

      const validRows = instrumentRows.filter((row) => row.instrument_name.trim())
      if (validRows.length) {
        const rows = validRows.map((row) => ({
          cycle_id: cycleData.id,
          instrument_name: row.instrument_name,
          make: row.make,
          model: row.model,
          serial_number: row.serial_number,
          instrument_range: row.instrument_range,
          next_due_date: row.next_due_date || null,
          remarks: row.remarks,
        }))

        const { error: itemError } = await supabase.from('calibration_cycle_items').insert(rows)
        if (itemError) throw itemError
      }

      setScheduleName('')
      setScheduleReference('')
      setDescription('')
      setCustomerId('')
      setCycleNumber('1')
      setJobReference('')
      setCalibrationDate('')
      setCommonNextDueDate('')
      setTotalInstruments('0')
      setDueDateMode('COMMON')
      setStatus('PENDING')
      setRemarks('')
      setInstrumentRows([createEmptyInstrument()])
      navigate('/calibration-schedules/directory')
    } catch (submissionError) {
      setMessage(getSupabaseErrorMessage(submissionError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Schedules</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Add calibration schedule</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Customer</label>
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none focus:border-cyan-500">
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Schedule Name</label>
              <input value={scheduleName} onChange={(event) => setScheduleName(event.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Schedule Reference</label>
              <input value={scheduleReference} onChange={(event) => setScheduleReference(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Cycle Number</label>
              <input value={cycleNumber} onChange={(event) => setCycleNumber(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Job Reference</label>
              <input value={jobReference} onChange={(event) => setJobReference(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Calibration Date</label>
              <input
                type="date"
                value={calibrationDate}
                onChange={(event) => {
                  const value = event.target.value
                  setCalibrationDate(value)
                  setCommonNextDueDate(getCalibrationDueDate(value))
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Total Instruments</label>
              <input type="number" min="0" value={totalInstruments} onChange={(event) => setTotalInstruments(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date Mode</label>
              <select value={dueDateMode} onChange={(event) => setDueDateMode(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none focus:border-cyan-500">
                <option value="COMMON">COMMON</option>
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="MIXED">MIXED</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Calibration Due Date</label>
              <input type="date" value={commonNextDueDate} onChange={(event) => setCommonNextDueDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none focus:border-cyan-500" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <input value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Schedule Description</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="2" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Remarks</label>
              <textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} rows="2" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Optional instrument details</h2>
              <button type="button" onClick={addInstrumentRow} className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-500">
                <Plus className="h-4 w-4" />
                Add instrument
              </button>
            </div>

            <div className="space-y-3">
              {instrumentRows.map((row, index) => (
                <div key={row.id || index} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-2 xl:grid-cols-6">
                  <input value={row.instrument_name} onChange={(event) => updateInstrumentRow(index, 'instrument_name', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 outline-none focus:border-cyan-500" placeholder="Instrument name" />
                  <input value={row.make} onChange={(event) => updateInstrumentRow(index, 'make', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 outline-none focus:border-cyan-500" placeholder="Make" />
                  <input value={row.model} onChange={(event) => updateInstrumentRow(index, 'model', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 outline-none focus:border-cyan-500" placeholder="Model" />
                  <input value={row.serial_number} onChange={(event) => updateInstrumentRow(index, 'serial_number', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 outline-none focus:border-cyan-500" placeholder="Serial number" />
                  <input value={row.instrument_range} onChange={(event) => updateInstrumentRow(index, 'instrument_range', event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 outline-none focus:border-cyan-500" placeholder="Range" />
                  <div className="flex gap-2">
                    <input type="date" value={row.next_due_date} onChange={(event) => updateInstrumentRow(index, 'next_due_date', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 outline-none focus:border-cyan-500" placeholder="Next due date" />
                    {instrumentRows.length > 1 ? (
                      <button type="button" onClick={() => removeInstrumentRow(index)} className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-medium text-rose-700">
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {message ? (
            <div className={`${message.startsWith('Schedule') || message.startsWith('Data') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'} rounded-xl border px-3 py-2 text-sm`}>
              {message}
            </div>
          ) : null}

          <button type="submit" disabled={saving} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-60">
            {saving ? 'Saving schedule...' : 'Create schedule and cycle'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ScheduleDirectoryPage() {
  const [customers, setCustomers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [editForm, setEditForm] = useState({ customer_id: '', schedule_name: '', schedule_reference: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deletingScheduleId, setDeletingScheduleId] = useState('')
  const [editError, setEditError] = useState('')

  useEffect(() => {
    const loadSchedules = async () => {
      if (!supabase) return
      const [customerResult, scheduleResult] = await Promise.all([
        supabase.from('customers').select('*').order('company_name'),
        supabase.from('calibration_schedules').select('*').order('created_at', { ascending: false }),
      ])

      if (customerResult.error) setError(getSupabaseErrorMessage(customerResult.error))
      else if (scheduleResult.error) setError(getSupabaseErrorMessage(scheduleResult.error))
      setCustomers(customerResult.data || [])
      setSchedules(scheduleResult.data || [])
      setLoading(false)
    }

    loadSchedules()
  }, [])

  const startEditing = (schedule) => {
    setEditingSchedule(schedule)
    setEditForm({
      customer_id: schedule.customer_id || '',
      schedule_name: schedule.schedule_name || '',
      schedule_reference: schedule.schedule_reference || '',
      description: schedule.description || '',
    })
    setError('')
    setEditError('')
  }

  const handleUpdateSchedule = async (event) => {
    event.preventDefault()
    if (!supabase || !editingSchedule) return

    try {
      setSaving(true)
      setEditError('')
      const { error: updateError } = await supabase
        .from('calibration_schedules')
        .update(editForm)
        .eq('id', editingSchedule.id)
      if (updateError) throw updateError

      setSchedules((current) => current.map((schedule) =>
        schedule.id === editingSchedule.id ? { ...schedule, ...editForm } : schedule,
      ))
      setEditingSchedule(null)
    } catch (updateError) {
      setEditError(getSupabaseErrorMessage(updateError))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSchedule = async (schedule) => {
    const confirmed = window.confirm(
      `Delete ${schedule.schedule_name}? This will also permanently delete its calibration cycles and instrument records.`,
    )
    if (!confirmed || !supabase) return

    try {
      setDeletingScheduleId(schedule.id)
      setError('')
      const { error: deleteError } = await supabase.from('calibration_schedules').delete().eq('id', schedule.id)
      if (deleteError) throw deleteError
      setSchedules((current) => current.filter((entry) => entry.id !== schedule.id))
    } catch (deleteError) {
      setError(getSupabaseErrorMessage(deleteError))
    } finally {
      setDeletingScheduleId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Schedules</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Schedule Directory</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        {error ? <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">Loading schedules...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Schedule name</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{schedule.schedule_name}</td>
                  <td className="px-4 py-3">{schedule.schedule_reference || '—'}</td>
                  <td className="px-4 py-3">{customers.find((customer) => customer.id === schedule.customer_id)?.company_name || '—'}</td>
                  <td className="px-4 py-3">{formatDate(schedule.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(schedule)}
                        aria-label={`Edit ${schedule.schedule_name}`}
                        title="Edit schedule"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(schedule)}
                        disabled={deletingScheduleId === schedule.id}
                        aria-label={`Delete ${schedule.schedule_name}`}
                        title="Delete schedule"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!schedules.length ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No schedules found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {editingSchedule ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-schedule-title"
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Schedules</p>
                <h2 id="edit-schedule-title" className="mt-1 text-xl font-semibold text-slate-900">Edit schedule</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                aria-label="Close edit schedule dialog"
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleUpdateSchedule} className="space-y-4">
              <div>
                <label htmlFor="edit-schedule-customer" className="mb-1.5 block text-sm font-medium text-slate-700">Customer</label>
                <select
                  id="edit-schedule-customer"
                  value={editForm.customer_id}
                  onChange={(event) => setEditForm((current) => ({ ...current, customer_id: event.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none focus:border-cyan-500"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.company_name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-schedule-name" className="mb-1.5 block text-sm font-medium text-slate-700">Schedule Name</label>
                <input
                  id="edit-schedule-name"
                  value={editForm.schedule_name}
                  onChange={(event) => setEditForm((current) => ({ ...current, schedule_name: event.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="edit-schedule-reference" className="mb-1.5 block text-sm font-medium text-slate-700">Schedule Reference</label>
                <input
                  id="edit-schedule-reference"
                  value={editForm.schedule_reference}
                  onChange={(event) => setEditForm((current) => ({ ...current, schedule_reference: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="edit-schedule-description" className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  id="edit-schedule-description"
                  value={editForm.description}
                  onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-500"
                />
              </div>
              {editError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{editError}</div> : null}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingSchedule(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function DueDateAlertsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRows = async () => {
      if (!supabase) return

      const [customersResult, scheduleResult, cyclesResult, itemsResult] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('calibration_schedules').select('*').eq('is_active', true),
        supabase.from('calibration_cycles').select('*'),
        supabase.from('calibration_cycle_items').select('*'),
      ])

      const customers = customersResult.data || []
      const schedules = scheduleResult.data || []
      const cycles = cyclesResult.data || []
      const items = itemsResult.data || []

      const scheduleRows = schedules.map((schedule) => {
        const latestCycle = cycles
          .filter((cycle) => cycle.schedule_id === schedule.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

        const itemsForCycle = latestCycle ? items.filter((item) => item.cycle_id === latestCycle.id) : []
        const effectiveDueDate = latestCycle ? getEffectiveDueDate(latestCycle, itemsForCycle) : null
        const dueState = effectiveDueDate ? getDueStatus(effectiveDueDate) : { label: 'UPCOMING', bucket: 'UPCOMING', days: null }

        return {
          ...schedule,
          customer: customers.find((customer) => customer.id === schedule.customer_id),
          latestCycle,
          dueState,
          effectiveDueDate,
        }
      })

      setRows(scheduleRows)
      setLoading(false)
    }

    loadRows()
  }, [])

  const alertRows = rows.filter((row) => row.dueState?.label !== 'UPCOMING')

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Alerts</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Due date alerts</h1>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Loading due-date alerts...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Next due date</th>
                <th className="px-4 py-3 font-medium">Days remaining</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {alertRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{row.customer?.company_name || '—'}</td>
                  <td className="px-4 py-3">{row.schedule_reference || row.schedule_name}</td>
                  <td className="px-4 py-3">{formatDate(row.effectiveDueDate)}</td>
                  <td className="px-4 py-3">{row.dueState.days ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClasses(row.dueState.label)}`}>
                      {row.dueState.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ReportsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const exportCsv = () => {
    const csvRows = [
      ['Customer', 'Schedule', 'Reference', 'Due Date Mode', 'Next Due Date', 'Status'],
      ...rows.map((row) => [
        row.customer?.company_name || '',
        row.schedule_name,
        row.schedule_reference || '',
        row.latestCycle?.due_date_mode || 'COMMON',
        formatDate(row.effectiveDueDate),
        row.dueState?.label || 'UPCOMING',
      ]),
    ]

    const csvContent = csvRows
      .map((values) => values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'calibration-schedule-report.csv'
    link.click()
  }

  useEffect(() => {
    const loadRows = async () => {
      if (!supabase) return

      const [customersResult, schedulesResult, cyclesResult, itemsResult] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('calibration_schedules').select('*').eq('is_active', true),
        supabase.from('calibration_cycles').select('*'),
        supabase.from('calibration_cycle_items').select('*'),
      ])

      const customers = customersResult.data || []
      const schedules = schedulesResult.data || []
      const cycles = cyclesResult.data || []
      const items = itemsResult.data || []

      const scheduleRows = schedules.map((schedule) => {
        const latestCycle = cycles
          .filter((cycle) => cycle.schedule_id === schedule.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

        const itemsForCycle = latestCycle ? items.filter((item) => item.cycle_id === latestCycle.id) : []
        const effectiveDueDate = latestCycle ? getEffectiveDueDate(latestCycle, itemsForCycle) : null
        const dueState = effectiveDueDate ? getDueStatus(effectiveDueDate) : { label: 'UPCOMING', bucket: 'UPCOMING', days: null }

        return {
          ...schedule,
          customer: customers.find((customer) => customer.id === schedule.customer_id),
          latestCycle,
          dueState,
          effectiveDueDate,
        }
      })

      setRows(scheduleRows)
      setLoading(false)
    }

    loadRows()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Reports</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Calibration summary</h1>
        </div>
        <button type="button" onClick={exportCsv} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500">
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Preparing report...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Next due date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{row.customer?.company_name || '—'}</td>
                  <td className="px-4 py-3">{row.schedule_name}</td>
                  <td className="px-4 py-3">{row.schedule_reference || '—'}</td>
                  <td className="px-4 py-3">{row.latestCycle?.due_date_mode || 'COMMON'}</td>
                  <td className="px-4 py-3">{formatDate(row.effectiveDueDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClasses(row.dueState?.label || 'UPCOMING')}`}>
                      {row.dueState?.label || 'UPCOMING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Operational setup</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Security checklist</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>1. Enable Email sign-in in Supabase Auth.</li>
            <li>2. Apply the SQL migration for all required tables and indexes.</li>
            <li>3. Keep the service-role key only in the server-side environment, never in frontend code.</li>
            <li>4. Validate due dates and instrument counts before saving.</li>
            <li>5. Keep historical cycles immutable and never delete them accidentally.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Environment values</h2>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-200">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      return undefined
    }

    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setAuthReady(true)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setSession(null)
  }

  if (!isSupabaseConfigured) {
    return <SetupGuide />
  }

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">Loading authentication...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {!session ? (
          <Route path="*" element={<LoginPage onAuthSuccess={() => setSession(true)} />} />
        ) : (
          <Route element={<AppShell onSignOut={handleSignOut} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<Navigate to="/customers/directory" replace />} />
            <Route path="/customers/add" element={<AddCustomerPage />} />
            <Route path="/customers/directory" element={<CustomerDirectoryPage />} />
            <Route path="/calibration-schedules" element={<Navigate to="/calibration-schedules/directory" replace />} />
            <Route path="/calibration-schedules/add" element={<AddSchedulePage />} />
            <Route path="/calibration-schedules/directory" element={<ScheduleDirectoryPage />} />
            <Route path="/due-date-alerts" element={<DueDateAlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
