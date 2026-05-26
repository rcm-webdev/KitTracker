import { CLINIC_PROVIDERS } from "@strawhats/shared"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProviderTagsFieldProps {
  value: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  /** Surgeons this user may assign; defaults to full clinic list. */
  allowedProviders?: readonly string[]
}

export default function ProviderTagsField({
  value,
  onChange,
  disabled,
  allowedProviders = CLINIC_PROVIDERS,
}: ProviderTagsFieldProps) {
  const surgeons = CLINIC_PROVIDERS.filter((doctor) =>
    allowedProviders.includes(doctor)
  );
  function addTag(tag: string) {
    if (value.some((t) => t === tag)) return
    onChange([...value, tag])
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">Provider</p>
      <p className="text-[10px] text-muted-foreground">
        Assign this kit to one or more surgeons so techs can filter every related
        kit when preparing a room.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {surgeons.map((doctor) => {
          const selected = value.includes(doctor)
          return (
            <button
              key={doctor}
              type="button"
              disabled={disabled}
              onClick={() =>
                selected ? removeTag(doctor) : addTag(doctor)
              }
              className="rounded-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Badge
                variant={selected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  !selected && "hover:bg-muted"
                )}
              >
                {doctor}
                {selected && (
                  <X className="ml-1 size-3" aria-hidden />
                )}
              </Badge>
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] text-muted-foreground">Selected:</span>
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                className="rounded-sm hover:bg-muted"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
