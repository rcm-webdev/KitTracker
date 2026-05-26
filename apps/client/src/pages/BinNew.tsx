import { useNavigate, Link, Navigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useCreateBin, useBinProviders } from "../hooks/useBins"
import { useMe } from "../hooks/useMe"
import ProviderTagsField from "@/components/ProviderTagsField"
import { binSchema, type BinSchema } from "@/lib/schemas"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function BinNew() {
  const navigate = useNavigate()
  const { data: me, isPending: mePending } = useMe()
  const { data: allowedProviders = [] } = useBinProviders()
  const createBin = useCreateBin()

  if (!mePending && me && !me.permissions.canCreateKits) {
    return <Navigate to="/dashboard" replace />
  }

  const form = useForm<BinSchema>({
    resolver: zodResolver(binSchema),
    defaultValues: { name: "", location: "", description: "", providerTags: [] },
  })

  function onSubmit(values: BinSchema) {
    createBin.mutate(
      {
        name: values.name,
        location: values.location,
        description: values.description || undefined,
        providerTags: values.providerTags,
      },
      { onSuccess: (bin) => navigate(`/bins/${bin.id}`) }
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        to="/dashboard"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Back to procedure kits
      </Link>
      <h1 className="mt-4 text-lg font-semibold">New procedure kit</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        One kit per in-clinic procedure setup so ophthalmic techs can prep rooms
        with confidence.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kit name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Cataract Kit A"
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room / location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. OR 2, Prep Room, Sterile Core"
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
            name="providerTags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ProviderTagsField
                    value={field.value}
                    onChange={field.onChange}
                    allowedProviders={allowedProviders}
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
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Procedure details or prep notes for techs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {createBin.isError && (
            <p role="alert" className="text-xs text-destructive">
              {createBin.error.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={createBin.isPending}>
              {createBin.isPending && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              {createBin.isPending ? "Creating..." : "Create kit"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
