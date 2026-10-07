import { useState } from "react";
import EnquiryTable from "../Components/EnquiryTable";
import PageHeading from "../Components/PageHeading";

const initialCustomer = { companyName: "", contactPerson: "", mobile: "", email: "", city: "" };

export default function EnquiriesPage({ customers, enquiries, products, onCreate, onStatus }) {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [enquiryForm, setEnquiryForm] = useState({ enquiryDate: new Date().toISOString().slice(0, 10), requiredDate: "", notes: "" });
  const [items, setItems] = useState([{ productId: "", quantity: "1" }]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const addItem = () => setItems([...items, { productId: "", quantity: "1" }]);
  const changeItem = (index, key, value) => setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      await onCreate(
        { customer: customerForm, enquiry: { ...enquiryForm, items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity) })) } },
        selectedCustomer,
      );
      setCustomerForm(initialCustomer);
      setEnquiryForm({ enquiryDate: new Date().toISOString().slice(0, 10), requiredDate: "", notes: "" });
      setItems([{ productId: "", quantity: "1" }]);
      setSelectedCustomer("");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading eyebrow="CUSTOMER PIPELINE" title="Enquiries" description="Capture customer requirements and track each opportunity." action={<span className="count-pill">{enquiries.length} total</span>} />
      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>Create customer enquiry</h2><p>Customer details and product requirements</p></div><span className="required-hint">* Required</span></div>
        <form onSubmit={submit} className="form-stack">
          <div className="form-section-title"><span>01</span> Customer details</div>
          <label>Existing customer
            <select value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)}>
              <option value="">Add a new customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName || customer.company}</option>)}
            </select>
          </label>
          {!selectedCustomer && <div className="form-grid two-col">
            <label>Company name *<input value={customerForm.companyName} onChange={(event) => setCustomerForm({ ...customerForm, companyName: event.target.value })} required /></label>
            <label>Contact person *<input value={customerForm.contactPerson} onChange={(event) => setCustomerForm({ ...customerForm, contactPerson: event.target.value })} required /></label>
            <label>Mobile *<input type="tel" value={customerForm.mobile} onChange={(event) => setCustomerForm({ ...customerForm, mobile: event.target.value })} required /></label>
            <label>Email<input type="email" value={customerForm.email} onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })} /></label>
            <label>City<input value={customerForm.city} onChange={(event) => setCustomerForm({ ...customerForm, city: event.target.value })} /></label>
          </div>}
          <div className="form-section-title"><span>02</span> Enquiry details</div>
          <div className="form-grid two-col">
            <label>Enquiry date *<input type="date" value={enquiryForm.enquiryDate} onChange={(event) => setEnquiryForm({ ...enquiryForm, enquiryDate: event.target.value })} required /></label>
            <label>Required date<input type="date" min={enquiryForm.enquiryDate} value={enquiryForm.requiredDate} onChange={(event) => setEnquiryForm({ ...enquiryForm, requiredDate: event.target.value })} /></label>
          </div>
          <div className="items-editor">
            <div className="items-label"><strong>Products and quantities</strong><button type="button" className="link-button" onClick={addItem}>＋ Add product</button></div>
            {items.map((item, index) => (
              <div className="item-input-row" key={index}>
                <label className="item-product">Product *
                  <select required value={item.productId} onChange={(event) => changeItem(index, "productId", event.target.value)}>
                    <option value="">Select a product</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.productCode} — {product.name}</option>)}
                  </select>
                </label>
                <label className="item-quantity">Quantity *
                  <input type="number" min="1" step="1" required value={item.quantity} onChange={(event) => changeItem(index, "quantity", event.target.value)} />
                </label>
                {items.length > 1 && <button type="button" className="icon-button remove-item" aria-label="Remove product" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>×</button>}
              </div>
            ))}
          </div>
          <label>Notes<textarea rows="3" placeholder="Add delivery, application or other relevant details" value={enquiryForm.notes} onChange={(event) => setEnquiryForm({ ...enquiryForm, notes: event.target.value })} /></label>
          {formError && <div className="notice notice-error" role="alert">{formError}</div>}
          <div className="form-actions"><span className="muted">Status will start as NEW.</span><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Create enquiry →"}</button></div>
        </form>
      </section>
      <section className="panel table-panel">
        <div className="panel-heading"><div><h2>All enquiries</h2><p>Customer requests and their current status</p></div></div>
        <EnquiryTable enquiries={enquiries} onStatus={onStatus} />
      </section>
    </>
  );
}
