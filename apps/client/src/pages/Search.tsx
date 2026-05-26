import { useState } from "react"
import { Package, MapPin, Search as SearchIcon } from "lucide-react"
import { useSearchParams, Link } from "react-router"
import { useSearch } from "../hooks/useSearch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const [inputValue, setInputValue] = useState(q)

  const { data: results = [], isPending, isError, error } = useSearch(q)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() })
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold">Search supplies</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Find which bin and location holds a procedure supply.
      </p>

      <form onSubmit={handleSearch} className="mt-6">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by supply name..."
            className="pl-8"
            autoFocus
          />
        </div>
        <Button type="submit" className="mt-2">
          Search
        </Button>
      </form>

      {isPending && <p className="mt-4 text-xs text-muted-foreground">Searching...</p>}
      {isError && (
        <p role="alert" className="mt-4 text-xs text-destructive">
          {error.message}
        </p>
      )}

      {!isPending && q && results.length === 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          No supplies found for &ldquo;{q}&rdquo;.
        </p>
      )}

      <ul className="mt-6 divide-y divide-border border border-border">
        {results.map((result) => (
          <li key={result.item.id} className="px-3 py-3 text-xs">
            <strong>{result.item.name}</strong>
            {result.item.description && (
              <span className="text-muted-foreground">
                {" "}
                — {result.item.description}
              </span>
            )}
            <p className="mt-1 flex flex-wrap items-center gap-1 text-muted-foreground">
              <Package className="size-3.5" />
              <Link
                to={`/bins/${result.binId}`}
                className="text-foreground hover:underline"
              >
                {result.binName}
              </Link>
              <span>·</span>
              <MapPin className="size-3.5" />
              {result.binLocation}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
