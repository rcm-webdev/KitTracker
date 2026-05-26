import { useParams } from "react-router"
import { usePublicKit } from "../hooks/usePublicKit"
import PublicKitView from "../components/PublicKitView"
import KioskSignIn from "../components/KioskSignIn"

export default function PublicKit() {
  const { id } = useParams<{ id: string }>()
  const { data: bin, isPending, isError, error } = usePublicKit(id!)

  return (
    <div className="min-h-screen bg-muted/50 px-4 py-8">
      <p className="mx-auto mb-4 max-w-lg text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        Strawhats · procedure supply reference
      </p>

      {isPending && (
        <p className="mx-auto max-w-lg text-center text-xs text-muted-foreground">
          Loading kit…
        </p>
      )}

      {isError && (
        <p
          role="alert"
          className="mx-auto max-w-lg text-center text-xs text-destructive"
        >
          {error.message}
        </p>
      )}

      {bin && (
        <>
          <PublicKitView bin={bin} />
          <KioskSignIn kitId={bin.id} />
        </>
      )}
    </div>
  )
}
