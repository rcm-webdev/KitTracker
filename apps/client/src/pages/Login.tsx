import AuthLayout, { AuthFooterLink } from "@/components/AuthLayout"
import LoginForm from "@/components/LoginForm"
import { DEMO_USER } from "@kittracker/shared"

export default function Login() {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Procedure supply reference for clinical operations"
      footer={
        <>
          <p className="mb-3 rounded-none border border-border bg-muted/40 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Demo login</span>
            {" — "}
            {DEMO_USER.email} / {DEMO_USER.password}
            <br />
            Run <code className="text-foreground">npm run db:seed</code> first to
            load kits for Dr. Eye through Dr. Eye8.
          </p>
          <AuthFooterLink
            text="No account?"
            linkText="Create account"
            to="/register"
          />
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
