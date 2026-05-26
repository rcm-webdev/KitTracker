import { useState } from "react"
import { PackageOpen, Search } from "lucide-react"
import { Link, useNavigate } from "react-router"
import BinCard from "../components/BinCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useBins, useBinProviders, type BinListFilters } from "../hooks/useBins"
import { useMe } from "../hooks/useMe"

export default function Dashboard() {
  const navigate = useNavigate()
  const [locationFilter, setLocationFilter] = useState("")
  const [providerFilter, setProviderFilter] = useState("")
  const [search, setSearch] = useState("")

  const filters: BinListFilters = {
    ...(locationFilter ? { location: locationFilter } : {}),
    ...(providerFilter ? { provider: providerFilter } : {}),
  }
  const hasFilters = Boolean(locationFilter || providerFilter)

  const { data: bins = [], isPending, isError, error } = useBins(
    hasFilters ? filters : undefined
  )
  const { data: me } = useMe()
  const { data: providers = [] } = useBinProviders()

  const { data: allBins = [] } = useBins()
  const locations = [...new Set(allBins.map((b) => b.location))].sort()

  const kitCount = bins.length
  const locationCount = new Set(bins.map((b) => b.location)).size

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Procedure kits</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {kitCount} kit{kitCount === 1 ? "" : "s"}
            {locationCount > 0
              ? ` across ${locationCount} location${locationCount === 1 ? "" : "s"}`
              : ""}
            {providerFilter ? ` · ${providerFilter}` : ""}
          </p>
          <p className="mt-2 max-w-xl text-xs text-muted-foreground">
            Each kit is a labeled supply bin for an in-clinic procedure. Techs
            scan the QR code to open the supply list, or filter by provider to
            prep every related kit before a case.
          </p>
        </div>
        {me?.permissions.canCreateKits && (
          <Button asChild>
            <Link to="/bins/new">New kit</Link>
          </Button>
        )}
      </div>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (search.trim()) {
            navigate(`/search?q=${encodeURIComponent(search.trim())}`)
          }
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search supplies by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </form>

      {providers.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Provider
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setProviderFilter("")}>
              <Badge variant={providerFilter === "" ? "default" : "outline"}>
                All providers
              </Badge>
            </button>
            {providers.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() =>
                  setProviderFilter((current) =>
                    current === provider ? "" : provider
                  )
                }
              >
                <Badge
                  variant={providerFilter === provider ? "default" : "outline"}
                >
                  {provider}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {locations.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Location
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setLocationFilter("")}>
              <Badge variant={locationFilter === "" ? "default" : "outline"}>
                All locations
              </Badge>
            </button>
            {locations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() =>
                  setLocationFilter((current) => (current === loc ? "" : loc))
                }
              >
                <Badge
                  variant={locationFilter === loc ? "default" : "outline"}
                >
                  {loc}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <p role="alert" className="mt-4 text-xs text-destructive">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isPending
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 border border-border p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          : bins.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center gap-3 border border-dashed border-border py-16 text-center">
                <PackageOpen className="size-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {hasFilters
                    ? "No kits match these filters"
                    : "No procedure kits yet"}
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  {hasFilters
                    ? "Try another provider or location, or clear filters."
                    : "Create a kit for each procedure setup so techs can scan and prep rooms with confidence."}
                </p>
                {!hasFilters && (
                  <Button asChild>
                    <Link to="/bins/new">Create your first kit</Link>
                  </Button>
                )}
              </div>
            )
            : bins.map((bin) => (
                <BinCard
                  key={bin.id}
                  bin={bin}
                  canEdit={me?.permissions.canEditKits ?? false}
                />
              ))}
      </div>
    </div>
  )
}
