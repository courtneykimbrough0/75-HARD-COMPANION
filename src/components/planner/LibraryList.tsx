import { Pencil, Plus, Trash2 } from 'lucide-react'

export interface LibraryEntry {
  id: string
  title: string
  subtitle: string
}

interface LibraryListProps {
  label: string
  entries: LibraryEntry[]
  emptyHint: string
  onNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

/** Shared list shell for the saved-meals and saved-workouts libraries. */
export function LibraryList({
  label,
  entries,
  emptyHint,
  onNew,
  onEdit,
  onDelete,
}: LibraryListProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          {label}
        </h2>
        <button
          type="button"
          onClick={onNew}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-300 transition-all hover:bg-purple-500/20 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none active:scale-95"
        >
          <Plus size={12} /> New
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5 text-center text-xs text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-gray-200">{entry.title}</span>
                <span className="truncate text-xs text-gray-500">{entry.subtitle}</span>
              </div>
              <button
                type="button"
                onClick={() => onEdit(entry.id)}
                aria-label={`Edit ${entry.title}`}
                className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:text-purple-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                aria-label={`Delete ${entry.title}`}
                className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-colors hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
