import { useEffect } from "react"
import { Loader2, MapPin, X } from "lucide-react"
import { useParams, Link, useSearchParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import QRCode from "../components/QRCode"
import procedureSetupPlaceholder from "@/assets/procedure-setup-placeholder.png"
import { publicKitUrl } from "@/lib/kitUrls"
import { useBin } from "../hooks/useBin"
import { useMe } from "../hooks/useMe"
import { canMutateBin } from "@kittracker/shared"
import { useAddItem, useDeleteItem } from "../hooks/useItems"
import { itemSchema, type ItemSchema } from "@/lib/schemas"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function BinDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const scanned = searchParams.get("scanned") === "1"

  const { data: me } = useMe()
  const { data: bin, isPending, isError, error } = useBin(id!)
  const addItem = useAddItem(id!)
  const deleteItem = useDeleteItem(id!)

  const accessResolved = Boolean(me && bin)
  const isKiosk = me?.permissions.isKiosk ?? false
  const canEdit =
    accessResolved && !isKiosk && canMutateBin(me!, bin!)
  const readOnly = accessResolved && (isKiosk || !canMutateBin(me!, bin!))

  const form = useForm<ItemSchema>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", description: "" },
  })

  useEffect(() => {
    if (scanned) {
      document.getElementById("kit-supplies")?.scrollIntoView({ behavior: "smooth" })
    }
  }, [scanned, bin])

  function onAddItem(values: ItemSchema) {
    addItem.mutate(
      {
        name: values.name.trim(),
        description: values.description || undefined,
      },
      {
        onSuccess: () => form.reset({ name: "", description: "" }),
      }
    )
  }

  if (isPending) return null
  if (isError) {
    return (
      <p role="alert" className="text-xs text-destructive">
        {error.message}
      </p>
    )
  }
  if (!bin) return <p className="text-sm">Kit not found.</p>

  const tags = bin.providerTags ?? []

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/dashboard"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Back to procedure kits
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{bin.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {bin.location}
            </span>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </p>
          {bin.description && (
            <p className="mt-2 text-xs text-muted-foreground">{bin.description}</p>
          )}
        </div>
        <div className="flex gap-2 text-xs">
          {canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/bins/${bin.id}/edit`}>Edit kit</Link>
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/bins/${bin.id}/label`}>Print label</Link>
            </Button>
          )}
        </div>
      </div>

      {readOnly && (
        <p className="mt-4 border border-border bg-muted/40 px-3 py-2 text-xs">
          View-only mode — clinic tablets can scan and review supplies. Sign in
          with a team account to edit this kit.
        </p>
      )}

      {scanned && !readOnly && (
        <p className="mt-4 border border-border bg-muted/40 px-3 py-2 text-xs">
          QR scan successful — review the supply list below to prep this room.
        </p>
      )}

      <section id="kit-supplies" className="mt-6 scroll-mt-4">
        <h2 className="text-sm font-semibold">
          Supply list ({bin.items?.length ?? 0})
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Everything in this procedure kit. Scanning the printed QR opens a
          read-only supply sheet for clinic tablets.
        </p>
        <ul className="mt-3 divide-y divide-border border border-border bg-card">
          {(bin.items ?? []).map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 px-3 py-2.5 text-xs"
            >
              <div>
                <strong>{item.name}</strong>
                {item.description && (
                  <span className="text-muted-foreground">
                    {" "}
                    — {item.description}
                  </span>
                )}
              </div>
              {canEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => deleteItem.mutate(item.id)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </li>
          ))}
          {(bin.items ?? []).length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">
              No supplies in this kit yet. Add items below or scan again after
              stocking the bin.
            </li>
          )}
        </ul>
      </section>

      {canEdit && (
      <section className="mt-8">
        <h3 className="text-sm font-semibold">Add supply</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onAddItem)}
            className="mt-3 space-y-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. BSS, viscoelastic, gauze"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Size, lot notes, or alternate name"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {addItem.isError && (
              <p role="alert" className="text-xs text-destructive">
                {addItem.error.message}
              </p>
            )}
            <Button type="submit" disabled={addItem.isPending}>
              {addItem.isPending && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              {addItem.isPending ? "Adding..." : "Add item"}
            </Button>
          </form>
        </Form>
      </section>
      )}

      {canEdit && (
      <section className="mt-8 border border-border p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kit QR (tablet scan)
        </h3>
        <div className="mt-3">
          <QRCode url={publicKitUrl(bin.id)} size={140} />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Encodes a public link ({publicKitUrl(bin.id)}). Print from{" "}
          <strong>Print label</strong> and attach to the physical kit.
        </p>
      </section>
      )}

      <section className="mt-8 border border-border p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Procedure setup
        </h3>
        <div className="relative mt-3 overflow-hidden border border-border">
          <img
            src={procedureSetupPlaceholder}
            alt="Example surgical tray layout"
            className="aspect-[4/3] w-full object-cover"
          />
          <p
            className="absolute inset-x-0 bottom-0 bg-foreground/85 px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-background"
            aria-label="Placeholder image — not an actual kit setup"
          >
            Placeholder — not an actual kit setup
          </p>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Reference layout for room prep. Use the supply list above for what is
          in this kit.
        </p>
      </section>
    </div>
  )
}
