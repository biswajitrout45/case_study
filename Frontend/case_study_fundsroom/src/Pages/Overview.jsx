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
        action={<button className="button button-primary" onClick={() => onNavigate("Enquiries")}>＋ New enquiry</button>}
      />
      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-top"><span>{stat.label}</span><span className={`stat-icon ${stat.tone}`}>{stat.icon}</span></div>
            <strong className="stat-value">{stat.value}</strong><small>{stat.note}</small>
          </article>
        ))}
      </div>
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-heading">
            <div><h2>Recent enquiries</h2><p>Latest customer requests</p></div>
            <button className="link-button" onClick={() => onNavigate("Enquiries")}>View all →</button>
          </div>
          {enquiries.length
            ? <EnquiryTable enquiries={enquiries.slice(0, 5)} compact />
            : <EmptyState title="No enquiries yet" detail="Create your first customer enquiry to get started." />}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div><h2>Sales order status</h2><p>Orders waiting for action</p></div>
            <button className="link-button" onClick={() => onNavigate("Sales orders")}>View orders →</button>
          </div>
          {orders.length ? (
            <div className="simple-list">{orders.slice(0, 5).map((order) => (
              <div className="simple-row" key={order.id}>
                <div><strong>{order.orderNumber}</strong><small>{order.customerName}</small></div>
                <StatusBadge status={order.status} />
              </div>
            ))}</div>
          ) : <EmptyState title="No sales orders" detail="Create an order from an enquiry when it is ready." />}
        </section>
      </div>
      <section className="tip-banner">
        <span className="tip-icon">✦</span>
        <div><strong>Stock checks happen when orders are confirmed</strong><p>Available stock is calculated from physical quantity minus reservations. Only an administrator can confirm an order.</p></div>
      </section>
    </>
  );
}
