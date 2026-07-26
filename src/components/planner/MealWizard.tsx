import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Sheet } from '@/components/ui/Sheet'
import { newId } from '@/lib/logic/ids'
import { MEAL_SLOTS, MEAL_SLOT_LABELS } from '@/lib/schemas/planner'
import type { Meal, MealSlot } from '@/types'

const SLOT_OPTIONS = MEAL_SLOTS.map((slot) => ({ value: slot, label: MEAL_SLOT_LABELS[slot] }))

interface MealFormValues {
  name: string
  slot: MealSlot
  dishes: { id: string; name: string; amount: string; recipe: string }[]
}

function blankDish() {
  return { id: newId(), name: '', amount: '', recipe: '' }
}

function toFormValues(meal?: Meal): MealFormValues {
  if (!meal) return { name: '', slot: 'breakfast', dishes: [blankDish()] }
  return {
    name: meal.name,
    slot: meal.slot,
    dishes: meal.dishes.map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.amount ?? '',
      recipe: d.recipe ?? '',
    })),
  }
}

interface MealWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing an existing saved meal. */
  meal?: Meal
  onSave: (meal: Meal) => void
}

export function MealWizard({ open, onOpenChange, meal, onSave }: MealWizardProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MealFormValues>({ defaultValues: toFormValues(meal) })

  const { fields, append, remove } = useFieldArray({ control, name: 'dishes' })

  // Re-seed whenever the sheet opens so editing a different meal doesn't inherit
  // the previous one's values.
  useEffect(() => {
    if (open) reset(toFormValues(meal))
  }, [open, meal, reset])

  const slot = watch('slot')

  const submit = handleSubmit((values) => {
    const now = Date.now()
    const dishes = values.dishes
      .filter((d) => d.name.trim().length > 0)
      .map((d) => ({
        id: d.id,
        name: d.name.trim(),
        amount: d.amount.trim(),
        ...(d.recipe.trim() ? { recipe: d.recipe.trim() } : {}),
      }))

    onSave({
      id: meal?.id ?? newId(),
      name: values.name.trim(),
      slot: values.slot,
      dishes,
      createdAt: meal?.createdAt ?? now,
      updatedAt: now,
    })
    onOpenChange(false)
  })

  const dishCount = watch('dishes')?.filter((d) => d.name.trim()).length ?? 0

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={meal ? 'Edit meal' : 'New meal'}
      description="Saved to your library — assign it to any day, any week."
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => void submit()} disabled={dishCount === 0}>
            {meal ? 'Save changes' : 'Save meal'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Meal name" error={errors.name?.message}>
          <TextInput
            placeholder="e.g. Chicken & Rice"
            {...register('name', { required: 'Meal name is required' })}
          />
        </Field>

        <Field label="Slot">
          <Select
            label="Meal slot"
            value={slot}
            onChange={(v) => setValue('slot', v)}
            options={SLOT_OPTIONS}
          />
        </Field>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              Dishes
            </span>
            <button
              type="button"
              onClick={() => append(blankDish())}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-300 transition-all hover:bg-purple-500/20 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none active:scale-95"
            >
              <Plus size={12} /> Add dish
            </button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500">#{index + 1}</span>
                <div className="flex-1" />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove dish ${index + 1}`}
                    className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <TextInput
                  className="col-span-2"
                  placeholder="Dish, e.g. Grilled chicken"
                  {...register(`dishes.${index}.name` as const)}
                />
                <TextInput placeholder="6 oz" {...register(`dishes.${index}.amount` as const)} />
              </div>
              <TextArea
                rows={2}
                placeholder="Recipe or prep notes (optional)"
                {...register(`dishes.${index}.recipe` as const)}
              />
            </div>
          ))}

          {dishCount === 0 && (
            <p className="text-[11px] font-medium text-amber-400">
              Add at least one dish with a name to save this meal.
            </p>
          )}
        </div>
      </div>
    </Sheet>
  )
}
