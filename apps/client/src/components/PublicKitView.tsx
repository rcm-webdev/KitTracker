import { MapPin } from "lucide-react"
import type { PublicBin } from "@kittracker/shared"
import procedureSetupPlaceholder from "@/assets/procedure-setup-placeholder.png"
import { Badge } from "@/components/ui/badge"

interface PublicKitViewProps {
  bin: PublicBin
}

/**
 * Read-only, print-friendly kit layout for clinic tablets (no app chrome).
 */
export default function PublicKitView({ bin }: PublicKitViewProps) {
  const items = bin.items ?? []
  const tags = bin.providerTags ?? []

  return (
    <article className="public-kit mx-auto max-w-lg border-2 border-foreground bg-background p-4 font-mono text-foreground shadow-sm">
      <header className="border-b-2 border-foreground pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Procedure kit
        </p>
        <h1 className="mt-1 text-xl font-bold leading-tight">{bin.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {bin.location}
          </span>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-none font-mono text-[10px]"
            >
              {tag}
            </Badge>
          ))}
        </p>
        {bin.description && (
          <p className="mt-2 text-xs text-muted-foreground">{bin.description}</p>
        )}
      </header>

      <section className="mt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide">
          Supply list ({items.length})
        </h2>
        <ul className="mt-2 divide-y divide-border border border-border">
          {items.length === 0 ? (
            <li className="px-3 py-4 text-center text-xs text-muted-foreground">
              No supplies listed for this kit yet.
            </li>
          ) : (
            items.map((item) => (
              <li key={item.id} className="px-3 py-2 text-xs">
                <strong>{item.name}</strong>
                {item.description && (
                  <span className="text-muted-foreground">
                    {" "}
                    — {item.description}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-6 border border-border p-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Procedure setup
        </h2>
        <div className="relative mt-2 overflow-hidden border border-border">
          <img
            src={procedureSetupPlaceholder}
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
          <p className="absolute inset-x-0 bottom-0 bg-foreground/85 px-2 py-1.5 text-center text-[9px] font-medium uppercase tracking-wide text-background">
            Placeholder — not an actual kit setup
          </p>
        </div>
      </section>
    </article>
  )
}
