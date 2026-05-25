import QRCode from "./QRCode";
import { MapPin } from "lucide-react";
import type { Bin } from "@strawhats/shared";

interface PrintLabelProps {
  bin: Bin;
  appUrl: string;
}

export default function PrintLabel({ bin, appUrl }: PrintLabelProps) {
  const binUrl = `${appUrl}/bins/${bin.id}`;
  const itemCount = bin.items?.length ?? 0;

  return (
    <div
      className="print-label"
      style={{
        width: 300,
        padding: 16,
        border: "2px solid #000",
        borderRadius: 8,
        fontFamily: "monospace",
        background: "#fff",
      }}
    >
      <QRCode url={binUrl} size={200} />
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 18, fontWeight: "bold" }}>{bin.name}</div>
        <div style={{ fontSize: 14 }}><MapPin size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {bin.location}</div>
        {bin.description && (
          <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{bin.description}</div>
        )}
        <div style={{ fontSize: 12, marginTop: 4 }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}
