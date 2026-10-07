import { useState } from "react";
import PageHeading from "../Components/PageHeading";
import { formatMoney } from "../Services/api";

export default function ProductsPage({ products, isAdmin, onCreate, onRestock }) {
  const [form, setForm] = useState({ productCode: "", name: "", category: "", unit: "pcs", basePrice: "" });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [physicalQuantity, setPhysicalQuantity] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onCreate({ ...form, basePrice: Number(form.basePrice) });
      setForm({ productCode: "", name: "", category: "", unit: "pcs", basePrice: "" });
      setOpen(false);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveRestock = async (product) => {
    setBusy(true);
    setError("");
    try {
      await onRestock(product.inventoryId, physicalQuantity);
      setEditingProductId("");
    } catch (restockError) {
      setError(restockError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="CATALOGUE"
        title="Product master"
        description="Manage products, pricing and the stock position for each item."
        action={isAdmin && <button className="button button-primary" onClick={() => setOpen(!open)}>{open ? "Close" : "＋ Add product"}</button>}
      />
      {open && (
        <section className="panel form-panel">
          <div className="panel-heading"><div><h2>Add a product</h2><p>New products start with zero physical and reserved stock.</p></div></div>
          <form className="form-grid two-col" onSubmit={submit}>
            <label>Product code *<input value={form.productCode} onChange={(event) => setForm({ ...form, productCode: event.target.value })} required /></label>
            <label>Product name *<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label>Category *<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></label>
            <label>Unit *<input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} required /></label>
            <label>Base price *<input type="number" min="0" step="0.01" value={form.basePrice} onChange={(event) => setForm({ ...form, basePrice: event.target.value })} required /></label>
            {error && <div className="notice notice-error form-wide">{error}</div>}
            <div className="form-actions form-wide"><span /><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Save product"}</button></div>
          </form>
        </section>
      )}
      <section className="panel table-panel">
        <div className="panel-heading"><div><h2>Products</h2><p>{products.length} items in your catalogue</p></div><span className="count-pill">{products.length} products</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Unit</th><th>Base price</th><th>Available</th>{isAdmin && <th>Stock action</th>}</tr></thead>
            <tbody>{products.map((product) => (
              <tr key={product.id}>
                <td><strong className="table-primary">{product.name}</strong><small className="table-sub">{product.productCode}</small></td>
                <td>{product.category}</td><td>{product.unit}</td><td>{formatMoney(product.basePrice)}</td>
                <td><strong>{Number(product.availableQuantity || 0).toLocaleString("en-IN")}</strong></td>
                {isAdmin && <td>{editingProductId === product.id
                  ? <div className="row-actions">
                    <input
                      className="quantity-edit"
                      type="number"
                      min={product.reservedQuantity}
                      step="1"
                      value={physicalQuantity}
                      onChange={(event) => setPhysicalQuantity(event.target.value)}
                      aria-label={`New physical quantity for ${product.name}`}
                    />
                    <button className="link-button" disabled={busy} onClick={() => saveRestock(product)}>Save</button>
                    <button className="link-button muted-link" disabled={busy} onClick={() => setEditingProductId("")}>Cancel</button>
                  </div>
                  : <button
                    className="link-button"
                    disabled={!product.inventoryId}
                    onClick={() => {
                      setEditingProductId(product.id);
                      setPhysicalQuantity(String(product.physicalQuantity));
                    }}
                  >Edit stock</button>}</td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}
