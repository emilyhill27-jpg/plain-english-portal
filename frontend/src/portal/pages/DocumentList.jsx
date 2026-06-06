import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '../components/StatusBadge'
import { usePermission } from '../lib/portalPermissions'
import { MOCK_DOCUMENTS, formatDate, formatFileSize } from '../lib/mockData'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { value: 'all',      label: 'All' },
  { value: 'draft',    label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function DocumentList() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const canUpload = usePermission('upload')
  const navigate = useNavigate()

  const filtered = MOCK_DOCUMENTS.filter(doc => {
    const matchesStatus = activeTab === 'all' || doc.status === activeTab
    const matchesSearch = !search ||
      doc.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.internal_ref ?? '').toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const countFor = (status) =>
    status === 'all'
      ? MOCK_DOCUMENTS.length
      : MOCK_DOCUMENTS.filter(d => d.status === status).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Documents</h1>
        {canUpload && (
          <Button asChild>
            <Link to="/portal/documents/new">
              <Plus className="h-4 w-4" />
              Upload document
            </Link>
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-frame">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.value
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-mid hover:text-ink'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 rounded-full px-1.5 py-0.5 text-xs',
              activeTab === tab.value ? 'bg-accent-light text-accent' : 'bg-frame-light text-ink-faint'
            )}>
              {countFor(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or reference"
          className="pl-9"
        />
      </div>

      {/* Document table */}
      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-ink-mid">
            {search ? 'No documents match this search.' : 'No documents in this category.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-sm text-accent hover:underline"
            >
              Clear search
            </button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-frame bg-frame-bg">
                <th className="px-5 py-3 text-left text-xs font-medium text-ink-soft">Document name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ink-soft">Category</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ink-soft">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ink-soft">Version</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ink-soft">Last updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-frame">
              {filtered.map(doc => (
                <tr
                  key={doc.id}
                  onClick={() => navigate(`/portal/documents/${doc.id}`)}
                  className="cursor-pointer hover:bg-frame-bg transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-ink">{doc.display_name}</p>
                    {doc.internal_ref && (
                      <p className="text-xs text-ink-faint mt-0.5">{doc.internal_ref}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-mid">{doc.category}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-mid">v{doc.version_number}</td>
                  <td className="px-5 py-4 text-xs text-ink-soft">
                    {formatDate(doc.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
