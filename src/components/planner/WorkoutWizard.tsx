import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Sheet } from '@/components/ui/Sheet'
import { Toggle } from '@/components/ui/Toggle'
import { newId } from '@/lib/logic/ids'
import { WORKOUT_KINDS, WORKOUT_KIND_LABELS } from '@/lib/schemas/planner'
import { WORKOUT_MIN_MINUTES } from '@/lib/logic/constants'
import type { WorkoutKind, WorkoutTemplate } from '@/types'

const KIND_OPTIONS = WORKOUT_KINDS.map((kind) => ({
  value: kind,
  label: WORKOUT_KIND_LABELS[kind],
}))

interface WorkoutFormValues {
  name: string
  kind: WorkoutKind
  isOutdoor: boolean
  targetMinutes: number
  exercises: { id: string; name: string; sets: string; reps: string; notes: string }[]
}

function blankExercise() {
  return { id: newId(), name: '', sets: '', reps: '', notes: '' }
}

function toFormValues(template?: WorkoutTemplate): WorkoutFormValues {
  if (!template) {
    return {
      name: '',
      kind: 'lift',
      isOutdoor: false,
      targetMinutes: WORKOUT_MIN_MINUTES,
      exercises: [blankExercise()],
    }
  }
  return {
    name: template.name,
    kind: template.kind,
    isOutdoor: template.isOutdoor,
    targetMinutes: template.targetMinutes,
    exercises: template.exercises.length
      ? template.exercises.map((e) => ({
          id: e.id,
          name: e.name,
          sets: e.sets != null ? String(e.sets) : '',
          reps: e.reps ?? '',
          notes: e.notes ?? '',
        }))
      : [blankExercise()],
  }
}

interface WorkoutWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: WorkoutTemplate
  onSave: (template: WorkoutTemplate) => void
}

export function WorkoutWizard({ open, onOpenChange, template, onSave }: WorkoutWizardProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkoutFormValues>({ defaultValues: toFormValues(template) })

  const { fields, append, remove } = useFieldArray({ control, name: 'exercises' })

  useEffect(() => {
    if (open) reset(toFormValues(template))
  }, [open, template, reset])

  const kind = watch('kind')
  const isOutdoor = watch('isOutdoor')

  const submit = handleSubmit((values) => {
    const now = Date.now()
    const exercises = values.exercises
      .filter((e) => e.name.trim().length > 0)
      .map((e) => {
        const sets = Number.parseInt(e.sets, 10)
        return {
          id: e.id,
          name: e.name.trim(),
          ...(Number.isFinite(sets) && sets > 0 ? { sets } : {}),
          ...(e.reps.trim() ? { reps: e.reps.trim() } : {}),
          ...(e.notes.trim() ? { notes: e.notes.trim() } : {}),
        }
      })

    onSave({
      id: template?.id ?? newId(),
      name: values.name.trim(),
      kind: values.kind,
      isOutdoor: values.isOutdoor,
      targetMinutes: Number(values.targetMinutes) || WORKOUT_MIN_MINUTES,
      exercises,
      createdAt: template?.createdAt ?? now,
      updatedAt: now,
    })
    onOpenChange(false)
  })

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={template ? 'Edit workout' : 'New workout'}
      description="Saved to your library — assign it to any day, any week."
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => void submit()}>
            {template ? 'Save changes' : 'Save workout'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Workout name" error={errors.name?.message}>
          <TextInput
            placeholder="e.g. Push Day"
            {...register('name', { required: 'Workout name is required' })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select
              label="Workout type"
              value={kind}
              onChange={(v) => setValue('kind', v)}
              options={KIND_OPTIONS}
            />
          </Field>
          <Field label="Target minutes">
            <TextInput
              type="number"
              min={1}
              {...register('targetMinutes', { valueAsNumber: true })}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-200">Outdoor workout</span>
            <span className="text-[11px] text-gray-500">
              75 Hard requires one outdoor session per day
            </span>
          </div>
          <Toggle
            checked={isOutdoor}
            onChange={(v) => setValue('isOutdoor', v)}
            label="Outdoor workout"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              Exercises
            </span>
            <button
              type="button"
              onClick={() => append(blankExercise())}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-300 transition-all hover:bg-purple-500/20 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none active:scale-95"
            >
              <Plus size={12} /> Add exercise
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
                    aria-label={`Remove exercise ${index + 1}`}
                    className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <TextInput
                placeholder="Exercise, e.g. Bench press"
                {...register(`exercises.${index}.name` as const)}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  type="number"
                  min={1}
                  placeholder="Sets"
                  {...register(`exercises.${index}.sets` as const)}
                />
                <TextInput
                  placeholder="Reps, e.g. 8-10"
                  {...register(`exercises.${index}.reps` as const)}
                />
              </div>
              <TextArea
                rows={2}
                placeholder="Notes (optional)"
                {...register(`exercises.${index}.notes` as const)}
              />
            </div>
          ))}

          <p className="text-[11px] font-medium text-gray-600">
            Exercises are optional — a run or walk can just be a name and a target time.
          </p>
        </div>
      </div>
    </Sheet>
  )
}
