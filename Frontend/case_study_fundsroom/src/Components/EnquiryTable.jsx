import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

export default function EnquiryTable({ enquiries, onStatus, compact = false }) {
  if (!enquiries.length) {
    return <EmptyState title="No enquiries yet" detail="Your customer enquiries will appear here." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Enquiry</th><th>Customer</th><th>Products</th><th>Enquiry date</th><th>Status</th></tr></thead>
        <tbody>{enquiries.map((enquiry) => (
          <tr key={enquiry.id}>
            <td><strong className="table-primary">{enquiry.enquiryNumber || enquiry.id}</strong></td>
            <td><strong>{enquiry.companyName || enquiry.customerName || "—"}</strong><small className="table-sub">{enquiry.contactPerson || ""}</small></td>
            <td>{(enquiry.items || []).map((item) => (
              <span className="product-line" key={item.productId}>{item.productName || item.productCode} <b>× {item.quantity}</b></span>
            ))}</td>
            <td>{enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toLocaleDateString("en-IN") : "—"}</td>
            <td>{!compact && onStatus ? (
              <select
                className="status-select"
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
