import { Link } from "react-router";
import { MapPin } from "lucide-react";
import type { Bin } from "@strawhats/shared";

interface BinCardProps {
  bin: Bin;
}

export default function BinCard({ bin }: BinCardProps) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
      <h3>
        <Link to={`/bins/${bin.id}`}>{bin.name}</Link>
      </h3>
      <p><MapPin size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {bin.location}</p>
      {bin.description && <p>{bin.description}</p>}
      <p>{bin.items?.length ?? 0} item(s)</p>
      <Link to={`/bins/${bin.id}/edit`}>Edit</Link>
    </div>
  );
}
