import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/api/admin'
import {
  Code2, Terminal, Globe, Database, Cpu, Layers, GitBranch, Monitor, Smartphone, Server,
  Palette, Pen, Image, Brush, PenTool, LayoutDashboard,
  Megaphone, Target, TrendingUp, BarChart2, Mail, Share2, Volume2, Zap,
  Pencil, FileText, BookOpen, Edit, Type, AlignLeft, Newspaper, MessageSquare,
  Briefcase, Building, DollarSign, Calculator, PieChart, LineChart, Users, UserPlus,
  Film, Video, Music, Camera, Mic, Headphones, Radio, Play,
  Building2, Home, MapPin, Compass, Ruler, Map, Hammer, Wrench,
  Star, Heart, Rocket, Shield, Clock, Calendar, Search, Settings,
  Scissors, ShoppingBag, Truck, Package, Coffee, Activity, Stethoscope,
  Lightbulb, BookMarked, GraduationCap, Award, Trophy,
  Check, X,
} from 'lucide-react'

/* ── Icon registry ──────────────────────────────────────── */
const ICON_GROUPS = [
  {
    group: 'Development',
    icons: [
      { name: 'code-2',      Icon: Code2 },
      { name: 'terminal',    Icon: Terminal },
      { name: 'globe',       Icon: Globe },
      { name: 'database',    Icon: Database },
      { name: 'cpu',         Icon: Cpu },
      { name: 'layers',      Icon: Layers },
      { name: 'git-branch',  Icon: GitBranch },
      { name: 'monitor',     Icon: Monitor },
      { name: 'smartphone',  Icon: Smartphone },
      { name: 'server',      Icon: Server },
    ],
  },
  {
    group: 'Design',
    icons: [
      { name: 'palette',        Icon: Palette },
      { name: 'pen',            Icon: Pen },
      { name: 'image',          Icon: Image },
      { name: 'brush',          Icon: Brush },
      { name: 'layout-dashboard', Icon: LayoutDashboard },
      { name: 'pen-tool',       Icon: PenTool },
      { name: 'scissors',       Icon: Scissors },
      { name: 'edit',           Icon: Edit },
    ],
  },
  {
    group: 'Marketing',
    icons: [
      { name: 'megaphone',   Icon: Megaphone },
      { name: 'target',      Icon: Target },
      { name: 'trending-up', Icon: TrendingUp },
      { name: 'bar-chart-2', Icon: BarChart2 },
      { name: 'mail',        Icon: Mail },
      { name: 'share-2',     Icon: Share2 },
      { name: 'volume-2',   Icon: Volume2 },
      { name: 'zap',         Icon: Zap },
    ],
  },
  {
    group: 'Writing',
    icons: [
      { name: 'pencil',      Icon: Pencil },
      { name: 'file-text',   Icon: FileText },
      { name: 'book-open',   Icon: BookOpen },
      { name: 'edit',        Icon: Edit },
      { name: 'type',        Icon: Type },
      { name: 'align-left',    Icon: AlignLeft },
      { name: 'newspaper',     Icon: Newspaper },
      { name: 'message-square',Icon: MessageSquare },
    ],
  },
  {
    group: 'Business',
    icons: [
      { name: 'briefcase',   Icon: Briefcase },
      { name: 'building',    Icon: Building },
      { name: 'dollar-sign', Icon: DollarSign },
      { name: 'calculator',  Icon: Calculator },
      { name: 'pie-chart',   Icon: PieChart },
      { name: 'line-chart',  Icon: LineChart },
      { name: 'users',       Icon: Users },
      { name: 'user-plus',   Icon: UserPlus },
    ],
  },
  {
    group: 'Media',
    icons: [
      { name: 'film',        Icon: Film },
      { name: 'video',       Icon: Video },
      { name: 'music',       Icon: Music },
      { name: 'camera',      Icon: Camera },
      { name: 'mic',         Icon: Mic },
      { name: 'headphones',  Icon: Headphones },
      { name: 'radio',       Icon: Radio },
      { name: 'play',        Icon: Play },
    ],
  },
  {
    group: 'Architecture',
    icons: [
      { name: 'building-2',  Icon: Building2 },
      { name: 'home',        Icon: Home },
      { name: 'map-pin',     Icon: MapPin },
      { name: 'compass',     Icon: Compass },
      { name: 'ruler',       Icon: Ruler },
      { name: 'map',         Icon: Map },
      { name: 'hammer',      Icon: Hammer },
      { name: 'wrench',      Icon: Wrench },
    ],
  },
  {
    group: 'Education',
    icons: [
      { name: 'graduation-cap', Icon: GraduationCap },
      { name: 'book-marked',    Icon: BookMarked },
      { name: 'lightbulb',      Icon: Lightbulb },
      { name: 'lightbulb',      Icon: Lightbulb },
      { name: 'award',          Icon: Award },
      { name: 'trophy',         Icon: Trophy },
    ],
  },
  {
    group: 'Other',
    icons: [
      { name: 'star',        Icon: Star },
      { name: 'heart',       Icon: Heart },
      { name: 'rocket',      Icon: Rocket },
      { name: 'shield',      Icon: Shield },
      { name: 'clock',       Icon: Clock },
      { name: 'calendar',    Icon: Calendar },
      { name: 'search',      Icon: Search },
      { name: 'settings',    Icon: Settings },
      { name: 'shopping-bag',Icon: ShoppingBag },
      { name: 'truck',       Icon: Truck },
      { name: 'package',     Icon: Package },
      { name: 'coffee',      Icon: Coffee },
      { name: 'activity',   Icon: Activity },
      { name: 'stethoscope', Icon: Stethoscope },
    ],
  },
]

/* Flat map for lookup */
const ICON_MAP = Object.fromEntries(
  ICON_GROUPS.flatMap(g => g.icons.map(({ name, Icon }) => [name, Icon]))
)

function CategoryIcon({ name, className = 'h-4 w-4' }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return <span className="text-xs text-slate-300 font-mono">{name}</span>
  return <Icon className={className} />
}

/* ── Icon Picker Modal ──────────────────────────────────── */
function IconPicker({ value, onChange, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = ICON_GROUPS.map(g => ({
    ...g,
    icons: g.icons.filter(i =>
      !search || i.name.includes(search.toLowerCase())
    ),
  })).filter(g => g.icons.length > 0)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Choose an Icon</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search icons..."
            autoFocus
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {filtered.map(g => (
            <div key={g.group}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{g.group}</p>
              <div className="grid grid-cols-8 gap-1.5">
                {g.icons.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => { onChange(name); onClose() }}
                    title={name}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                      value === name
                        ? 'bg-slate-800 text-white shadow-md scale-110'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {value && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <CategoryIcon name={value} className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Selected: <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded">{value}</code></span>
            <button onClick={() => { onChange(''); onClose() }}
              className="ml-auto text-xs text-slate-400 hover:text-red-600 transition-colors">
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────── */
export default function AdminCategories() {
  const qc = useQueryClient()
  const [form, setForm]       = useState({ name: '', icon: '', parent_id: '' })
  const [showPicker, setShowPicker] = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [editForm, setEditForm]     = useState({})
  const [showEditPicker, setShowEditPicker] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn:  getAdminCategories,
  })
  const categories = data?.data ?? []

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setForm({ name: '', icon: '', parent_id: '' })
    },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, ...data }) => updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setEditingId(null)
    },
  })
  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })

  const startEdit = (c) => {
    setEditingId(c.id)
    setEditForm({ name: c.name, icon: c.icon ?? '', parent_id: c.parent_id ?? '' })
  }

  return (
    <div className="space-y-6">

      {/* Icon Pickers */}
      {showPicker && (
        <IconPicker value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} onClose={() => setShowPicker(false)} />
      )}
      {showEditPicker && (
        <IconPicker value={editForm.icon} onChange={v => setEditForm(f => ({ ...f, icon: v }))} onClose={() => setShowEditPicker(false)} />
      )}

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Categories
        </h2>
        <p className="text-sm text-slate-500 mt-1">Manage project categories shown to clients and freelancers.</p>
      </div>

      {/* Add form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Add new category</h3>
        <div className="flex gap-3 flex-wrap">

          {/* Icon picker button */}
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="h-10 w-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 hover:border-slate-400 transition-colors"
            title="Pick an icon"
          >
            {form.icon ? (
              <CategoryIcon name={form.icon} className="h-5 w-5 text-slate-700" />
            ) : (
              <span className="text-lg text-slate-300">+</span>
            )}
          </button>

          {/* Name */}
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Category name *"
            className="flex-1 min-w-[180px] rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />

          {/* Parent */}
          <select
            value={form.parent_id}
            onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
          >
            <option value="">Top-level</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button
            onClick={() => createMut.mutate(form)}
            disabled={!form.name.trim() || createMut.isPending}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50 transition-colors"
          >
            {createMut.isPending ? 'Adding…' : 'Add category'}
          </button>
        </div>

        {form.icon && (
          <p className="text-xs text-slate-400 mt-2 ms-13">
            Icon selected: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{form.icon}</code>
            <button onClick={() => setForm(f => ({ ...f, icon: '' }))} className="ms-2 text-red-400 hover:text-red-600">✕ clear</button>
          </p>
        )}
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">{categories.length} categories</p>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">No categories yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map(c => (
              <div key={c.id} className="px-5 py-3.5">
                {editingId === c.id ? (
                  /* Edit row */
                  <div className="flex gap-3 items-center flex-wrap">
                    {/* Edit icon picker */}
                    <button type="button" onClick={() => setShowEditPicker(true)}
                      className="h-9 w-9 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 hover:border-slate-400">
                      {editForm.icon
                        ? <CategoryIcon name={editForm.icon} className="h-4 w-4 text-slate-700" />
                        : <span className="text-slate-300 text-sm">+</span>}
                    </button>
                    <input value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="flex-1 min-w-[140px] rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    <div className="flex gap-2 ms-auto">
                      <button onClick={() => updateMut.mutate({ id: c.id, ...editForm })} disabled={updateMut.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div className="flex items-center gap-4">
                    {/* Icon display */}
                    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {c.icon
                        ? <CategoryIcon name={c.icon} className="h-4 w-4 text-slate-600" />
                        : <span className="text-xs text-slate-300">?</span>}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      {c.icon && <p className="text-xs text-slate-400 font-mono">{c.icon}</p>}
                    </div>

                    {/* Active toggle */}
                    <button
                      onClick={() => updateMut.mutate({ id: c.id, is_active: !c.is_active })}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                        c.is_active
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(c)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={() => window.confirm(`Delete "${c.name}"?`) && deleteMut.mutate(c.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
