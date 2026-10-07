import { useState } from "react";
import InventoryPage from "./Pages/Inventory";
import EnquiriesPage from "./Pages/Enquiries";
import Login from "./Pages/Login";
import OrdersPage from "./Pages/Orders";
import OverviewPage from "./Pages/Overview";
import ProductsPage from "./Pages/Products";
import WorkspaceLayout from "./Components/WorkspaceLayout";
import useDashboardData from "./Hooks/useDashboardData";
import useSession from "./Hooks/useSession";
import { apiRequest } from "./Services/api";

function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState("Overview");
  const {
    customers,
    enquiries,
    products,
    inventory,
    orders,
    notice,
    error,
    loading,
    setError,
    setNotice,
    runAction,
  } = useDashboardData();

  const navigate = (nextPage) => {
    setPage(nextPage);
    setError("");
    setNotice("");
  };

  const available = inventory.reduce(
    (sum, item) => sum + Number(item.availableQuantity ?? item.physicalQuantity - item.reservedQuantity),
    0,
  );
  const stats = [
    { label: "Total enquiries", value: enquiries.length, note: "Across all customers", tone: "blue", icon: "↗" },
    { label: "Need a quotation", value: enquiries.filter((item) => item.status === "NEW").length, note: "New enquiries", tone: "amber", icon: "◷" },
    { label: "Products", value: products.length, note: "In the product master", tone: "violet", icon: "▦" },
    { label: "Available units", value: available.toLocaleString("en-IN"), note: "Physical less reserved", tone: "green", icon: "✓" },
  ];

  let pageContent;
  if (page === "Overview") {
    pageContent = <OverviewPage stats={stats} enquiries={enquiries} orders={orders} onNavigate={navigate} />;
  } else if (page === "Enquiries") {
    pageContent = (
      <EnquiriesPage
        customers={customers}
        enquiries={enquiries}
        products={products}
        onCreate={(payload, customer) => runAction(async () => {
          let customerId = customer;
          if (!customerId) {
            const result = await apiRequest("/customers", {
              method: "POST",
              body: JSON.stringify(payload.customer),
            });
            customerId = result.data.id;
          }
          await apiRequest("/enquiries", {
            method: "POST",
            body: JSON.stringify({ ...payload.enquiry, customerId }),
          });
        }, "Enquiry created successfully.")}
        onStatus={(id, status) => runAction(
          () => apiRequest(`/enquiries/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          }),
          "Enquiry status updated.",
        )}
      />
    );
  } else if (page === "Products") {
    pageContent = (
      <ProductsPage
        products={products}
        isAdmin={user.role === "admin"}
        onCreate={(payload) => runAction(
          () => apiRequest("/products", { method: "POST", body: JSON.stringify(payload) }),
          "Product added to the catalogue.",
        )}
        onRestock={(inventoryId, physicalQuantity) => runAction(
          () => apiRequest(`/inventory/${inventoryId}`, {
            method: "PATCH",
            body: JSON.stringify({ physicalQuantity: Number(physicalQuantity) }),
          }),
          "Product stock updated.",
        )}
      />
    );
  } else if (page === "Inventory") {
    pageContent = (
      <InventoryPage
        inventory={inventory}
        isAdmin={user.role === "admin"}
        onUpdate={(id, physicalQuantity) => runAction(
          () => apiRequest(`/inventory/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ physicalQuantity: Number(physicalQuantity) }),
          }),
          "Physical quantity updated.",
        )}
      />
    );
  } else if (page === "Sales orders") {
    pageContent = (
      <OrdersPage
        orders={orders}
        enquiries={enquiries}
        isAdmin={user.role === "admin"}
        onCreate={(enquiryId) => runAction(
          () => apiRequest("/sales-orders", { method: "POST", body: JSON.stringify({ enquiryId }) }),
          "Sales order created. It is ready for admin confirmation.",
        )}
        onConfirm={(id) => runAction(
          () => apiRequest(`/sales-orders/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "CONFIRMED" }),
          }),
          "Order confirmed and inventory reserved.",
        )}
      />
    );
  }

  return (
    <WorkspaceLayout
      user={user}
      page={page}
      onNavigate={navigate}
      onLogout={onLogout}
      notice={notice}
      error={error}
      loading={loading}
    >
      {pageContent}
    </WorkspaceLayout>
  );
}

export default function App() {
  const { user, setUser, checkingSession, logout } = useSession();

  if (checkingSession) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Opening your workspace…</div>;
  return user ? <Dashboard user={user} onLogout={logout} /> : <Login onAuthenticated={setUser} />;
}
