import { useState } from "react";
import EnquiryTable from "../Components/EnquiryTable";
import PageHeading from "../Components/PageHeading";

const initialCustomer = { companyName: "", contactPerson: "", mobile: "", email: "", city: "" };
const fieldClass = "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
const labelClass = "grid gap-2 text-xs font-semibold text-slate-700";

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
      <PageHeading eyebrow="CUSTOMER PIPELINE" title="Enquiries" description="Capture customer requirements and track each opportunity." action={<span className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">{enquiries.length} total</span>} />
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div><h2 className="text-sm font-bold text-slate-800">Create customer enquiry</h2><p className="mt-1 text-xs text-slate-500">Customer details and product requirements</p></div><span className="text-xs text-slate-400">* Required</span>
        </div>
        <form onSubmit={submit} className="grid gap-4 p-5 max-sm:p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><span className="grid size-6 place-items-center rounded-md bg-blue-50 text-[10px] text-blue-700">01</span> Customer details</div>
          <label className={labelClass}>Existing customer
            <select className={fieldClass} value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)}>
              <option value="">Add a new customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName || customer.company}</option>)}
            </select>
          </label>
          {!selectedCustomer && <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-sm:grid-cols-1">
            <label className={labelClass}>Company name *<input className={fieldClass} value={customerForm.companyName} onChange={(event) => setCustomerForm({ ...customerForm, companyName: event.target.value })} required /></label>
            <label className={labelClass}>Contact person *<input className={fieldClass} value={customerForm.contactPerson} onChange={(event) => setCustomerForm({ ...customerForm, contactPerson: event.target.value })} required /></label>
            <label className={labelClass}>Mobile *<input className={fieldClass} type="tel" inputMode="tel" pattern="(?:\+91[ -]?)?[6-9](?:[0-9 -]*[0-9]){9}" title="Enter a valid Indian mobile number (10 digits, optionally prefixed with +91)." placeholder="9876543210 or +91 9876543210" value={customerForm.mobile} onChange={(event) => setCustomerForm({ ...customerForm, mobile: event.target.value })} required /></label>
            <label className={labelClass}>Email<input className={fieldClass} type="email" value={customerForm.email} onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })} /></label>
            <label className={labelClass}>City<input className={fieldClass} value={customerForm.city} onChange={(event) => setCustomerForm({ ...customerForm, city: event.target.value })} /></label>
          </div>}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><span className="grid size-6 place-items-center rounded-md bg-blue-50 text-[10px] text-blue-700">02</span> Enquiry details</div>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <label className={labelClass}>Enquiry date *<input className={fieldClass} type="date" value={enquiryForm.enquiryDate} onChange={(event) => setEnquiryForm({ ...enquiryForm, enquiryDate: event.target.value })} required /></label>
            <label className={labelClass}>Required date<input className={fieldClass} type="date" min={enquiryForm.enquiryDate} value={enquiryForm.requiredDate} onChange={(event) => setEnquiryForm({ ...enquiryForm, requiredDate: event.target.value })} /></label>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-700"><strong>Products and quantities</strong><button type="button" className="font-bold text-blue-700 hover:text-blue-900 hover:underline" onClick={addItem}>＋ Add product</button></div>
            {items.map((item, index) => (
              <div className="flex items-end gap-3 max-sm:items-stretch" key={index}>
                <label className={`${labelClass} min-w-0 flex-1`}>Product *
                  <select className={fieldClass} required value={item.productId} onChange={(event) => changeItem(index, "productId", event.target.value)}>
                    <option value="">Select a product</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.productCode} — {product.name}</option>)}
                  </select>
                </label>
                <label className={`${labelClass} w-32 max-sm:w-24`}>Quantity *
                  <input className={fieldClass} type="number" min="1" step="1" required value={item.quantity} onChange={(event) => changeItem(index, "quantity", event.target.value)} />
                </label>
                {items.length > 1 && <button type="button" className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-xl text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="Remove product" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>×</button>}
              </div>
            ))}
          </div>
          <label className={labelClass}>Notes<textarea className={`${fieldClass} min-h-20 resize-y`} rows="3" placeholder="Add delivery, application or other relevant details" value={enquiryForm.notes} onChange={(event) => setEnquiryForm({ ...enquiryForm, notes: event.target.value })} /></label>
          {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">{formError}</div>}
          <div className="flex items-center justify-between gap-4 pt-1 max-sm:items-start max-sm:flex-col"><span className="text-xs text-slate-500">Status will start as NEW.</span><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60" disabled={busy}>{busy ? "Saving…" : "Create enquiry →"}</button></div>
        </form>
      </section>
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 items-center border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">All enquiries</h2><p className="mt-1 text-xs text-slate-500">Customer requests and their current status</p></div></div>
        <EnquiryTable enquiries={enquiries} onStatus={onStatus} />
      </section>
    </>
  );
}
