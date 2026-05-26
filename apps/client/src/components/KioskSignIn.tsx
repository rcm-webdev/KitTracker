import { useState } from "react"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KIOSK_USER } from "@kittracker/shared"
import { signIn } from "@/lib/auth-client"
import { kioskPinSchema, type KioskPinSchema } from "@/lib/schemas"
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

interface KioskSignInProps {
  kitId: string
}

export default function KioskSignIn({ kitId }: KioskSignInProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()

  const form = useForm<KioskPinSchema>({
    resolver: zodResolver(kioskPinSchema),
    defaultValues: { pin: "" },
  })

  async function onSubmit(values: KioskPinSchema) {
    setServerError(null)
    const result = await signIn.email({
      email: KIOSK_USER.email,
      password: values.pin,
    })
    if (result.error) {
      setServerError("Incorrect PIN. Ask your lead for the clinic tablet code.")
      return
    }
    navigate(`/bins/${kitId}?scanned=1`, { replace: true })
  }

  return (
    <section className="mx-auto mt-6 max-w-lg border border-border bg-muted/30 p-4 font-mono">
      <h2 className="text-xs font-semibold uppercase tracking-wide">
        Staff sign-in
      </h2>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Optional — opens the full app to update this kit. Session is for shared
        clinic tablets only.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-3 space-y-3"
        >
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input
                value={KIOSK_USER.displayName}
                readOnly
                className="bg-muted"
                aria-readonly="true"
              />
            </FormControl>
          </FormItem>
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Enter clinic PIN"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {serverError && (
            <p role="alert" className="text-xs text-destructive">
              {serverError}
            </p>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in..." : "Open in app"}
          </Button>
        </form>
      </Form>
    </section>
  )
}
