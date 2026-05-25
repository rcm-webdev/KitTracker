import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useCreateBin } from "../hooks/useBins";

export default function BinNew() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const createBin = useCreateBin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createBin.mutate(
      { name, location, description: description || undefined },
      { onSuccess: (bin) => navigate(`/bins/${bin.id}`) }
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <Link to="/dashboard">← Back</Link>
      <h1>New Bin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Bin Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Hot Wheels Box 1"
          />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Storage Unit, Garage, House"
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
        {createBin.isError && (
          <p role="alert" style={{ color: "red" }}>{createBin.error.message}</p>
        )}
        <button type="submit" disabled={createBin.isPending}>
          {createBin.isPending ? "Creating..." : "Create Bin"}
        </button>
      </form>
    </div>
  );
}
