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
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700" role="alert">{error}</div>}
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div><h2 className="text-sm font-bold text-slate-800">Stock position</h2><p className="mt-1 text-xs text-slate-500">Available quantity is physical quantity less reservations.</p></div>
          <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500"><i className="size-2 rounded-full bg-emerald-500" /> In stock</span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead><tr className="bg-slate-50 text-[11px] font-bold tracking-wide text-slate-500"><th className="px-5 py-3">Product</th><th className="px-5 py-3">Physical quantity</th><th className="px-5 py-3">Reserved quantity</th><th className="px-5 py-3">Available quantity</th>{isAdmin && <th className="px-5 py-3">Action</th>}</tr></thead>
            <tbody>{inventory.map((item) => (
              <tr className="border-t border-slate-100 text-sm text-slate-600 hover:bg-slate-50/70" key={item.id}>
                <td className="px-5 py-4"><strong className="block text-sm font-semibold text-slate-700">{item.name}</strong><small className="mt-1 block text-xs text-slate-400">{item.productCode}</small></td>
                <td className="px-5 py-4">{editing === item.id
                  ? <input className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={item.reservedQuantity} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-label="New physical quantity" />
                  : Number(item.physicalQuantity).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4">{Number(item.reservedQuantity).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4"><span className={`font-bold ${Number(item.availableQuantity ?? item.physicalQuantity - item.reservedQuantity) <= 10 ? "text-amber-700" : "text-emerald-700"}`}>{Number(item.availableQuantity ?? item.physicalQuantity - item.reservedQuantity).toLocaleString("en-IN")}</span></td>
                {isAdmin && <td className="px-5 py-4">{editing === item.id
                  ? <div className="flex items-center gap-3"><button className="font-semibold text-blue-700 hover:text-blue-900 disabled:cursor-wait disabled:opacity-60" disabled={busy} onClick={() => save(item)}>Save</button><button className="text-slate-500 hover:text-slate-700" onClick={() => setEditing("")}>Cancel</button></div>
                  : <button className="font-semibold text-blue-700 hover:text-blue-900 hover:underline" onClick={() => { setEditing(item.id); setQuantity(item.physicalQuantity); }}>Adjust stock</button>}</td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Reserved quantity changes only when a sales order is confirmed. Physical stock is never reduced by a reservation.</div>
      </section>
    </>
  );
}
