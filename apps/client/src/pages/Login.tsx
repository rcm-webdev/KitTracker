import { useCallback, useRef, useState } from "react"
import AuthLayout, { AuthFooterLink } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import LoginForm from "@/components/LoginForm"
import { DEMO_TECHNICIAN, DEMO_USER } from "@kittracker/shared"
import { Check, Copy } from "lucide-react"

type DemoCopyField =
  | "lead-email"
  | "lead-password"
  | "tech-email"
  | "tech-password"

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

function DemoAccountBlock(props: {
  title: string
  email: string
  password: string
  emailField: DemoCopyField
  passwordField: DemoCopyField
  copiedField: DemoCopyField | null
  onCopy: (value: string, field: DemoCopyField) => void
}) {
  const { title, email, password, emailField, passwordField, copiedField, onCopy } = props

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-medium text-foreground">{title}</p>
      <DemoCredentialPill
        label="Email"
        value={email}
        copied={copiedField === emailField}
        copyLabel={`Copy ${title} email`}
        onCopy={() => onCopy(email, emailField)}
      />
      <DemoCredentialPill
        label="Password"
        value={password}
        copied={copiedField === passwordField}
        copyLabel={`Copy ${title} password`}
        onCopy={() => onCopy(password, passwordField)}
      />
    </div>
  )
}

function DemoLoginCredentials() {
  const [copiedField, setCopiedField] = useState<DemoCopyField | null>(null)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyValue = useCallback(async (value: string, field: DemoCopyField) => {
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
      <p className="mb-3 text-center font-medium text-foreground">Demo login</p>
      <div className="flex flex-col gap-4">
        <DemoAccountBlock
          title="Clinic lead"
          email={DEMO_USER.email}
          password={DEMO_USER.password}
          emailField="lead-email"
          passwordField="lead-password"
          copiedField={copiedField}
          onCopy={(value, field) => void copyValue(value, field)}
        />
        <div className="border-t border-border/60" aria-hidden />
        <DemoAccountBlock
          title="Technician"
          email={DEMO_TECHNICIAN.email}
          password={DEMO_TECHNICIAN.password}
          emailField="tech-email"
          passwordField="tech-password"
          copiedField={copiedField}
          onCopy={(value, field) => void copyValue(value, field)}
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
