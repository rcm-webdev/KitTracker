import { useState } from "react";
import { Package, MapPin } from "lucide-react";
import { useSearchParams, Link } from "react-router";
import { useSearch } from "../hooks/useSearch";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(q);

  const { data: results = [], isPending, isError, error } = useSearch(q);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <Link to="/dashboard">← Back</Link>
      <h1>Search Items</h1>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search by item name..."
          style={{ flexGrow: 1 }}
          autoFocus
        />
        <button type="submit">Search</button>
      </form>

      {isPending && <p>Searching...</p>}
      {isError && <p role="alert" style={{ color: "red" }}>{error.message}</p>}

      {!isPending && q && results.length === 0 && (
        <p>No items found for "{q}".</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map((result) => (
          <li key={result.item.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
            <strong>{result.item.name}</strong>
            {result.item.description && <span> — {result.item.description}</span>}
            <br />
            <span style={{ color: "#666" }}>
              <Package size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
              <Link to={`/bins/${result.binId}`}>{result.binName}</Link>
              {" · "}
              <MapPin size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {result.binLocation}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
