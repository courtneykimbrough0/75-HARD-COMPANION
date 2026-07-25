interface MealPlanEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MealPlanEditor({ value, onChange }: MealPlanEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-400">Meal Plan</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Breakfast, lunch, dinner for the week..."
        className="w-full resize-none rounded-xl bg-gray-900 p-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  )
}
