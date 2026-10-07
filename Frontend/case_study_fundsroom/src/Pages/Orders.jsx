import { useState } from "react";
import EmptyState from "../Components/EmptyState";
import PageHeading from "../Components/PageHeading";
import StatusBadge from "../Components/StatusBadge";
import { formatMoney } from "../Services/api";

export default function SalesOrdersPage({ orders, enquiries, isAdmin, onCreate, onConfirm }) {
  const [enquiryId, setEnquiryId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onCreate(enquiryId);
      setEnquiryId("");
    } catch (createError) {
      setError(createError.message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (id) => {
    setBusy(true);
    setError("");
    try {
      await onConfirm(id);
    } catch (confirmError) {
      setError(confirmError.message);
    } finally {
      setBusy(false);
    }
  };

  const orderableEnquiries = enquiries.filter((enquiry) => (
    !orders.some((order) => String(order.enquiryId) === String(enquiry.id))
    && ["NEW", "QUOTED"].includes(enquiry.status)
  ));

  return (
    <>
      <PageHeading eyebrow="ORDER MANAGEMENT" title="Sales orders" description="Create an order from an enquiry, then reserve available inventory on confirmation." />
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
      <section className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700">↗</span><div><strong className="text-xs text-blue-900">Confirmation reserves stock, it does not consume it.</strong><p className="mt-1 text-xs leading-relaxed text-blue-800/80">The backend checks and reserves every line in one transaction. If even one product is short, the order is not confirmed.</p></div>
      </section>
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 items-center border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">Create sales order</h2><p className="mt-1 text-xs text-slate-500">Choose an enquiry to carry its items into a new order.</p></div></div>
        <form className="flex items-end gap-4 p-5 max-sm:items-stretch max-sm:flex-col max-sm:p-3.5" onSubmit={create}>
          <label className="grid w-full max-w-md gap-2 text-xs font-semibold text-slate-700">Customer enquiry<select className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" value={enquiryId} onChange={(event) => setEnquiryId(event.target.value)} required>
            <option value="">Select an enquiry</option>
            {orderableEnquiries.map((enquiry) => <option key={enquiry.id} value={enquiry.id}>{enquiry.enquiryNumber} · {enquiry.companyName || enquiry.customerName}</option>)}
          </select></label>
          <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Creating…" : "Create order"}</button>
          {!orderableEnquiries.length && <span className="text-xs text-slate-500">Create an enquiry before creating a sales order.</span>}
        </form>
      </section>
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 items-center border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">All sales orders</h2><p className="mt-1 text-xs text-slate-500">{orders.length} orders</p></div></div>
        {!orders.length ? <EmptyState title="No sales orders yet" detail="Create an order from a customer enquiry." /> : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead><tr className="bg-slate-50 text-[10px] font-bold tracking-wide text-slate-500"><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Order total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
              <tbody>{orders.map((order) => (
                <tr className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/70" key={order.id}>
                  <td className="px-4 py-3"><strong className="font-semibold text-slate-700">{order.orderNumber}</strong></td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{(order.items || []).map((item) => <span className="my-0.5 block whitespace-nowrap text-[11px] text-slate-500" key={item.productId}>{item.productName} <b className="font-semibold text-slate-700">× {item.quantity}</b></span>)}</td>
                  <td className="px-4 py-3">{formatMoney(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">{isAdmin && order.status === "PENDING"
                    ? <button className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-3 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-60" disabled={busy} onClick={() => confirm(order.id)}>Confirm & reserve</button>
                    : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
