import { useCallback, useRef, useState } from "react"
import AuthLayout, { AuthFooterLink } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import LoginForm from "@/components/LoginForm"
import { DEMO_USER } from "@kittracker/shared"
import { Check, Copy } from "lucide-react"

function DemoCredentialPill(props: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
  copyLabel: string
}) {
  const { label, value, copied, onCopy, copyLabel } = props

  return (
    <div className="flex min-h-8 items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-[10px] text-muted-foreground shadow-sm">
      <span className="shrink-0 font-medium text-foreground">{label}</span>
      <code className="min-w-0 flex-1 truncate font-mono text-[10px]">{value}</code>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        className="shrink-0 rounded-full"
        aria-label={copyLabel}
        onClick={onCopy}
      >
        {copied ? <Check className="size-3 text-foreground" aria-hidden /> : <Copy className="size-3" aria-hidden />}
      </Button>
    </div>
  )
}

function DemoLoginCredentials() {
  const [copiedField, setCopiedField] = useState<"email" | "password" | null>(null)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyValue = useCallback(async (value: string, field: "email" | "password") => {
    try {
      await navigator.clipboard.writeText(value)
      if (clearTimer.current) clearTimeout(clearTimer.current)
      setCopiedField(field)
      clearTimer.current = setTimeout(() => {
        setCopiedField(null)
        clearTimer.current = null
      }, 2000)
    } catch {
      // Clipboard may be unavailable (permissions, insecure context); leave UI unchanged
    }
  }, [])

  return (
    <div className="mb-3 rounded-3xl border border-border bg-muted/40 px-3 py-2.5 text-[10px] leading-relaxed text-muted-foreground shadow-sm">
      <p className="mb-2 text-center font-medium text-foreground">Demo login</p>
      <div className="flex flex-col gap-2">
        <DemoCredentialPill
          label="Email"
          value={DEMO_USER.email}
          copied={copiedField === "email"}
          copyLabel="Copy demo email"
          onCopy={() => void copyValue(DEMO_USER.email, "email")}
        />
        <DemoCredentialPill
          label="Password"
          value={DEMO_USER.password}
          copied={copiedField === "password"}
          copyLabel="Copy demo password"
          onCopy={() => void copyValue(DEMO_USER.password, "password")}
        />
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Procedure supply reference for clinical operations"
      footer={
        <>
          <DemoLoginCredentials />
          {import.meta.env.VITE_REGISTRATION_ENABLED !== "false" && (
            <AuthFooterLink
              text="No account?"
              linkText="Create account"
              to="/register"
            />
          )}
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
