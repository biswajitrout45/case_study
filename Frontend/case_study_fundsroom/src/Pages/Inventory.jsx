import { useState } from "react";
import PageHeading from "../Components/PageHeading";

export default function InventoryPage({ inventory, isAdmin, onUpdate }) {
  const [editing, setEditing] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (item) => {
    setBusy(true);
    setError("");
    try {
      await onUpdate(item.id, quantity);
      setEditing("");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading eyebrow="STOCK CONTROL" title="Inventory" description="Physical, reserved and available quantities across your product catalogue." />
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="panel table-panel">
        <div className="panel-heading"><div><h2>Stock position</h2><p>Available quantity is physical quantity less reservations.</p></div><span className="stock-legend"><i /> In stock</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Physical quantity</th><th>Reserved quantity</th><th>Available quantity</th>{isAdmin && <th>Action</th>}</tr></thead>
            <tbody>{inventory.map((item) => (
              <tr key={item.id}>
                <td><strong className="table-primary">{item.name}</strong><small className="table-sub">{item.productCode}</small></td>
                <td>{editing === item.id
                  ? <input className="quantity-edit" type="number" min={item.reservedQuantity} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-label="New physical quantity" />
                  : Number(item.physicalQuantity).toLocaleString("en-IN")}</td>
                <td>{Number(item.reservedQuantity).toLocaleString("en-IN")}</td>
                <td><span className={`available-number ${item.availableQuantity <= 10 ? "low" : ""}`}>{Number(item.availableQuantity ?? item.physicalQuantity - item.reservedQuantity).toLocaleString("en-IN")}</span></td>
                {isAdmin && <td>{editing === item.id
                  ? <div className="row-actions"><button className="link-button" disabled={busy} onClick={() => save(item)}>Save</button><button className="link-button muted-link" onClick={() => setEditing("")}>Cancel</button></div>
                  : <button className="link-button" onClick={() => { setEditing(item.id); setQuantity(item.physicalQuantity); }}>Adjust stock</button>}</td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="table-footnote">Reserved quantity changes only when a sales order is confirmed. Physical stock is never reduced by a reservation.</div>
      </section>
    </>
  );
}
