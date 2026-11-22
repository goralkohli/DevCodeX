import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { searchIndex } from '../data/searchIndex'

const CATEGORIES = [
  'Topics',
  'Sandboxes',
  'Execution Steps',
  'Pitfalls',
  'Interview Insights',
]

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate()

  const handleSelect = (path) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Global Quick-Recall Palette"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
      contentClassName="fixed left-1/2 top-[15vh] -translate-x-1/2 z-50 w-full max-w-xl px-4 outline-none pointer-events-auto"
      className="bg-surface-raised border border-surface-overlay rounded-xl shadow-2xl w-full overflow-hidden"
    >
      <Command.Input
        placeholder="Type a topic, pitfall, or recall keyword..."
        className="w-full bg-transparent px-4 py-3.5 text-slate-100 placeholder-slate-400 border-b border-surface-overlay outline-none text-base"
      />

      <Command.List className="max-h-80 overflow-y-auto p-2 space-y-2">
        <Command.Empty className="px-4 py-8 text-center text-sm text-slate-400">
          No results found.
        </Command.Empty>

        {CATEGORIES.map((category) => {
          const categoryItems = searchIndex.filter((item) => item.category === category)
          if (categoryItems.length === 0) return null

          return (
            <Command.Group
              key={category}
              heading={category}
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              {categoryItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.title} ${item.subtitle || ''} ${item.keywords.join(' ')}`}
                  onSelect={() => handleSelect(item.path)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-200 cursor-pointer aria-selected:bg-primary/20 aria-selected:text-white transition-colors"
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="font-medium truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-slate-400 truncate">{item.subtitle}</span>
                    )}
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-base border border-surface-overlay text-gray-400">
                    {item.category}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )
        })}
      </Command.List>
    </Command.Dialog>
  )
}
