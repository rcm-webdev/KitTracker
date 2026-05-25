import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useBin, useUpdateBin } from "../hooks/useBin";

export default function BinEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const { data: bin, isPending } = useBin(id!);
  const updateBin = useUpdateBin(id!);

  useEffect(() => {
    if (bin) {
      setName(bin.name);
      setLocation(bin.location);
      setDescription(bin.description ?? "");
    }
  }, [bin]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateBin.mutate(
      { name, location, description: description || null },
      { onSuccess: () => navigate(`/bins/${id}`) }
    );
  }

  if (isPending) return null;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <Link to={`/bins/${id}`}>← Back</Link>
      <h1>Edit Bin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Storage Unit, Garage, House..."
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        {updateBin.isError && (
          <p role="alert" style={{ color: "red" }}>{updateBin.error.message}</p>
        )}
        <button type="submit" disabled={updateBin.isPending}>
          {updateBin.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
