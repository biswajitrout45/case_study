import { useState } from "react";
import PageHeading from "../Components/PageHeading";
import { formatMoney } from "../Services/api";

const fieldClass = "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
const labelClass = "grid gap-2 text-xs font-semibold text-slate-700";

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
        action={isAdmin && <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700" onClick={() => setOpen(!open)}>{open ? "Close" : "＋ Add product"}</button>}
      />
      {open && (
        <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex min-h-16 items-center border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">Add a product</h2><p className="mt-1 text-xs text-slate-500">New products start with zero physical and reserved stock.</p></div></div>
          <form className="grid grid-cols-2 gap-x-4 gap-y-3 p-5 max-sm:grid-cols-1 max-sm:p-3.5" onSubmit={submit}>
            <label className={labelClass}>Product code *<input className={fieldClass} value={form.productCode} onChange={(event) => setForm({ ...form, productCode: event.target.value })} required /></label>
            <label className={labelClass}>Product name *<input className={fieldClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label className={labelClass}>Category *<input className={fieldClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></label>
            <label className={labelClass}>Unit *<input className={fieldClass} value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} required /></label>
            <label className={labelClass}>Base price *<input className={fieldClass} type="number" min="0" step="0.01" value={form.basePrice} onChange={(event) => setForm({ ...form, basePrice: event.target.value })} required /></label>
            {error && <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">{error}</div>}
            <div className="col-span-full flex items-center justify-end pt-1"><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60" disabled={busy}>{busy ? "Saving…" : "Save product"}</button></div>
          </form>
        </section>
      )}
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">Products</h2><p className="mt-1 text-xs text-slate-500">{products.length} items in your catalogue</p></div><span className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">{products.length} products</span></div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-xs">
            <thead><tr className="bg-slate-50 text-[10px] font-bold tracking-wide text-slate-500"><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Unit</th><th className="px-4 py-3">Base price</th><th className="px-4 py-3">Available</th>{isAdmin && <th className="px-4 py-3">Stock action</th>}</tr></thead>
            <tbody>{products.map((product) => (
              <tr className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/70" key={product.id}>
                <td className="px-4 py-3"><strong className="block font-semibold text-slate-700">{product.name}</strong><small className="mt-1 block text-[11px] text-slate-400">{product.productCode}</small></td>
                <td className="px-4 py-3">{product.category}</td><td className="px-4 py-3">{product.unit}</td><td className="px-4 py-3">{formatMoney(product.basePrice)}</td>
                <td className="px-4 py-3"><strong className="font-bold text-slate-700">{Number(product.availableQuantity || 0).toLocaleString("en-IN")}</strong></td>
                {isAdmin && <td className="px-4 py-3">{editingProductId === product.id
                  ? <div className="flex items-center gap-2">
                    <input
                      className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      type="number"
                      min={product.reservedQuantity}
                      step="1"
                      value={physicalQuantity}
                      onChange={(event) => setPhysicalQuantity(event.target.value)}
                      aria-label={`New physical quantity for ${product.name}`}
                    />
                    <button className="font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-60" disabled={busy} onClick={() => saveRestock(product)}>Save</button>
                    <button className="font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-60" disabled={busy} onClick={() => setEditingProductId("")}>Cancel</button>
                  </div>
                  : <button
                    className="font-semibold text-blue-700 hover:text-blue-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={!product.inventoryId || busy}
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
