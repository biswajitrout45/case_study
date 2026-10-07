import EmptyState from "../Components/EmptyState";
import EnquiryTable from "../Components/EnquiryTable";
import PageHeading from "../Components/PageHeading";
import StatusBadge from "../Components/StatusBadge";

export default function Overview({ stats, enquiries, orders, onNavigate }) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR OPERATIONS AT A GLANCE"
        title="Good work starts here."
        description="A live overview of your enquiries, orders and stock position."
        action={<button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700" onClick={() => onNavigate("Enquiries")}>＋ New enquiry</button>}
      />
      <div className="mb-5 grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:gap-2">
        {stats.map((stat) => (
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm max-sm:p-3" key={stat.label}>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500"><span>{stat.label}</span><span className={`grid size-8 place-items-center rounded-lg text-base ${stat.tone === "blue" ? "bg-blue-50 text-blue-700" : stat.tone === "amber" ? "bg-amber-50 text-amber-700" : stat.tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700"}`}>{stat.icon}</span></div>
            <strong className="mt-4 block text-3xl font-bold tracking-tight text-slate-800 max-sm:text-2xl">{stat.value}</strong><small className="mt-1 block text-[11px] text-slate-400">{stat.note}</small>
          </article>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(280px,.9fr)] gap-4 max-lg:grid-cols-1">
        <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 className="text-sm font-bold text-slate-800">Recent enquiries</h2><p className="mt-1 text-xs text-slate-500">Latest customer requests</p></div>
            <button className="shrink-0 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline" onClick={() => onNavigate("Enquiries")}>View all →</button>
          </div>
          {enquiries.length
            ? <EnquiryTable enquiries={enquiries.slice(0, 5)} compact />
            : <EmptyState title="No enquiries yet" detail="Create your first customer enquiry to get started." />}
        </section>
        <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 className="text-sm font-bold text-slate-800">Sales order status</h2><p className="mt-1 text-xs text-slate-500">Orders waiting for action</p></div>
            <button className="shrink-0 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline" onClick={() => onNavigate("Sales orders")}>View orders →</button>
          </div>
          {orders.length ? (
            <div className="px-5">{orders.slice(0, 5).map((order) => (
              <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-100 last:border-0" key={order.id}>
                <div><strong className="block text-xs text-slate-700">{order.orderNumber}</strong><small className="mt-1 block text-[11px] text-slate-500">{order.customerName}</small></div>
                <StatusBadge status={order.status} />
              </div>
            ))}</div>
          ) : <EmptyState title="No sales orders" detail="Create an order from an enquiry when it is ready." />}
        </section>
      </div>
      <section className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700">✦</span>
        <div><strong className="text-xs text-blue-900">Stock checks happen when orders are confirmed</strong><p className="mt-1 text-xs leading-relaxed text-blue-800/80">Available stock is calculated from physical quantity minus reservations. Only an administrator can confirm an order.</p></div>
      </section>
    </>
  );
}
