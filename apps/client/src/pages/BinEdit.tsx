import { useEffect } from "react"
import { useParams, useNavigate, Link, Navigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useBin, useUpdateBin } from "../hooks/useBin"
import { useBinProviders } from "../hooks/useBins"
import { useMe } from "../hooks/useMe"
import { canMutateBin } from "@kittracker/shared"
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
import { Skeleton } from "@/components/ui/skeleton"

export default function BinEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { data: allowedProviders = [] } = useBinProviders()
  const { data: bin, isPending } = useBin(id!)
  const updateBin = useUpdateBin(id!)

  const canEdit = bin && me ? canMutateBin(me, bin) : false

  const form = useForm<BinSchema>({
    resolver: zodResolver(binSchema),
    defaultValues: { name: "", location: "", description: "", providerTags: [] },
  })

  useEffect(() => {
    if (bin) {
      form.reset({
        name: bin.name,
        location: bin.location,
        description: bin.description ?? "",
        providerTags: bin.providerTags ?? [],
      })
    }
  }, [bin, form])

  function onSubmit(values: BinSchema) {
    updateBin.mutate(
      {
        name: values.name,
        location: values.location,
        description: values.description || null,
        providerTags: values.providerTags,
      },
      {
        onSuccess: () => {
          toast.success("Changes saved")
          navigate(`/bins/${id}`)
        },
      }
    )
  }

  if (!isPending && bin && me && !canEdit) {
    return <Navigate to={`/bins/${id}`} replace />
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        to={`/bins/${id}`}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Back to kit
      </Link>
      <h1 className="mt-4 text-lg font-semibold">Edit procedure kit</h1>

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
                  <Input autoComplete="off" {...field} />
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
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {updateBin.isError && (
            <p role="alert" className="text-xs text-destructive">
              {updateBin.error.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={updateBin.isPending || form.formState.isSubmitting}
            >
              {(updateBin.isPending || form.formState.isSubmitting) && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              {updateBin.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to={`/bins/${id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
