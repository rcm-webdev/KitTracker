import { useState, FormEvent } from "react";
import { MapPin, X } from "lucide-react";
import { useParams, Link } from "react-router";
import QRCode from "../components/QRCode";
import { useBin } from "../hooks/useBin";
import { useAddItem, useDeleteItem } from "../hooks/useItems";

export default function BinDetail() {
  const { id } = useParams<{ id: string }>();
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");

  const { data: bin, isPending, isError, error } = useBin(id!);
  const addItem = useAddItem(id!);
  const deleteItem = useDeleteItem(id!);

  function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItem.mutate(
      { name: newItemName.trim(), description: newItemDesc || undefined },
      {
        onSuccess: () => {
          setNewItemName("");
          setNewItemDesc("");
        },
      }
    );
  }

  if (isPending) return null;
  if (isError) return <p role="alert" style={{ color: "red" }}>{error.message}</p>;
  if (!bin) return <p>Bin not found.</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <Link to="/dashboard">← Back</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>{bin.name}</h1>
          <p><MapPin size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {bin.location}</p>
          {bin.description && <p>{bin.description}</p>}
        </div>
        <div>
          <Link to={`/bins/${bin.id}/edit`}>Edit Bin</Link>
          {" | "}
          <Link to={`/bins/${bin.id}/label`}>Print Label</Link>
        </div>
      </div>

      <div style={{ margin: "16px 0" }}>
        <QRCode url={`${window.location.origin}/bins/${bin.id}`} size={160} />
        <p style={{ fontSize: 12, color: "#666", margin: "4px 0" }}>
          Scan to view this bin
        </p>
      </div>

      <h2>Items ({bin.items?.length ?? 0})</h2>
      <ul>
        {(bin.items ?? []).map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong>
            {item.description && ` — ${item.description}`}
            {" "}
            <button onClick={() => deleteItem.mutate(item.id)}>
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>

      <h3>Add Item</h3>
      <form onSubmit={handleAddItem} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newItemDesc}
          onChange={(e) => setNewItemDesc(e.target.value)}
        />
        <button type="submit" disabled={addItem.isPending}>
          {addItem.isPending ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
