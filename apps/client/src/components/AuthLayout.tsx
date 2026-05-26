import { Link } from "react-router"

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md border border-border bg-background p-6">
        <p className="text-xs font-semibold tracking-wide">STRAWHATS</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{subtitle}</p>
        <h1 className="mt-6 text-lg font-semibold">{title}</h1>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-xs text-muted-foreground">{footer}</div>
      </div>
    </div>
  )
}

export function AuthFooterLink({
  text,
  linkText,
  to,
}: {
  text: string
  linkText: string
  to: string
}) {
  return (
    <p>
      {text}{" "}
      <Link to={to} className="text-foreground underline-offset-4 hover:underline">
        {linkText}
      </Link>
    </p>
  )
}
