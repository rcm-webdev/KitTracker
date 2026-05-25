import { Printer } from "lucide-react";
import { useParams, Link } from "react-router";
import PrintLabel from "../components/PrintLabel";
import { useBin } from "../hooks/useBin";

export default function BinLabel() {
  const { id } = useParams<{ id: string }>();
  const { data: bin, isPending, isError, error } = useBin(id!);

  if (isPending) return null;
  if (isError) return <p role="alert" style={{ color: "red" }}>{error.message}</p>;
  if (!bin) return <p>Bin not found.</p>;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-label, .print-label * { visibility: visible; }
          .print-label { position: fixed; top: 0; left: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ maxWidth: 400, margin: "40px auto", padding: "0 16px" }}>
        <Link to={`/bins/${bin.id}`}>← Back to {bin.name}</Link>
        <h1>Print Label</h1>
        <p style={{ color: "#666" }}>
          Print this label and stick it on the physical box.
        </p>
        <button
          onClick={() => window.print()}
          style={{ marginBottom: 24, padding: "8px 16px" }}
        >
          <Printer size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Print Label
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <PrintLabel bin={bin} appUrl={window.location.origin} />
      </div>
    </>
  );
}
