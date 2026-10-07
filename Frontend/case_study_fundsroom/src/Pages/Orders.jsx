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
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="panel order-explainer"><span className="tip-icon">↗</span><div><strong>Confirmation reserves stock, it does not consume it.</strong><p>The backend checks and reserves every line in one transaction. If even one product is short, the order is not confirmed.</p></div></section>
      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>Create sales order</h2><p>Choose an enquiry to carry its items into a new order.</p></div></div>
        <form className="order-create" onSubmit={create}>
          <label>Customer enquiry<select value={enquiryId} onChange={(event) => setEnquiryId(event.target.value)} required>
            <option value="">Select an enquiry</option>
            {orderableEnquiries.map((enquiry) => <option key={enquiry.id} value={enquiry.id}>{enquiry.enquiryNumber} · {enquiry.companyName || enquiry.customerName}</option>)}
          </select></label>
          <button className="button button-primary" disabled={busy || !orderableEnquiries.length}>{busy ? "Creating…" : "Create order"}</button>
          {!orderableEnquiries.length && <span className="muted">Create an enquiry before creating a sales order.</span>}
        </form>
      </section>
      <section className="panel table-panel">
        <div className="panel-heading"><div><h2>All sales orders</h2><p>{orders.length} orders</p></div></div>
        {!orders.length ? <EmptyState title="No sales orders yet" detail="Create an order from a customer enquiry." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Order total</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{orders.map((order) => (
                <tr key={order.id}>
                  <td><strong className="table-primary">{order.orderNumber}</strong></td>
                  <td>{order.customerName}</td>
                  <td>{(order.items || []).map((item) => <span className="product-line" key={item.productId}>{item.productName} <b>× {item.quantity}</b></span>)}</td>
                  <td>{formatMoney(order.total)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{isAdmin && order.status === "PENDING"
                    ? <button className="button button-small button-primary" disabled={busy} onClick={() => confirm(order.id)}>Confirm & reserve</button>
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
