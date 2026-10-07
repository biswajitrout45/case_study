import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

export default function EnquiryTable({ enquiries, onStatus, compact = false }) {
  if (!enquiries.length) {
    return <EmptyState title="No enquiries yet" detail="Your customer enquiries will appear here." />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-xs">
        <thead><tr className="bg-slate-50 text-[10px] font-bold tracking-wide text-slate-500"><th className="whitespace-nowrap px-4 py-3">Enquiry</th><th className="whitespace-nowrap px-4 py-3">Customer</th><th className="whitespace-nowrap px-4 py-3">Products</th><th className="whitespace-nowrap px-4 py-3">Enquiry date</th><th className="whitespace-nowrap px-4 py-3">Status</th></tr></thead>
        <tbody>{enquiries.map((enquiry) => (
          <tr className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/70" key={enquiry.id}>
            <td className="px-4 py-3"><strong className="font-semibold text-slate-700">{enquiry.enquiryNumber || enquiry.id}</strong></td>
            <td className="px-4 py-3"><strong className="text-slate-700">{enquiry.companyName || enquiry.customerName || "—"}</strong><small className="mt-1 block text-[11px] text-slate-400">{enquiry.contactPerson || ""}</small></td>
            <td className="px-4 py-3">{(enquiry.items || []).map((item) => (
              <span className="my-0.5 block whitespace-nowrap text-[11px] text-slate-500" key={item.productId}>{item.productName || item.productCode} <b className="font-semibold text-slate-700">× {item.quantity}</b></span>
            ))}</td>
            <td className="px-4 py-3">{enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toLocaleDateString("en-IN") : "—"}</td>
            <td className="px-4 py-3">{!compact && onStatus ? (
              <select
                className="min-h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                value={enquiry.status}
                onChange={(event) => onStatus(enquiry.id, event.target.value).catch(() => {})}
                aria-label={`Status for ${enquiry.enquiryNumber}`}
              >
                {["NEW", "QUOTED", "WON", "LOST"].map((status) => <option key={status}>{status}</option>)}
              </select>
            ) : <StatusBadge status={enquiry.status} />}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
