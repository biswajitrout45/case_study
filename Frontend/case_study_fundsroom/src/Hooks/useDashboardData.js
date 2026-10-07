import { useEffect, useState } from "react";
import { fetchDashboardData } from "../Services/api";

export default function useDashboardData() {
  const [customers, setCustomers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const applyData = ([customerResult, enquiryResult, productResult, inventoryResult, orderResult]) => {
    setCustomers(customerResult.data);
    setEnquiries(enquiryResult.data);
    setProducts(productResult.data);
    setInventory(inventoryResult.data);
    setOrders(orderResult.data);
  };

  const refresh = async () => {
    try {
      applyData(await fetchDashboardData());
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchDashboardData()
      .then((data) => { if (active) applyData(data); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const runAction = async (action, successMessage) => {
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(successMessage);
      setLoading(true);
      await refresh();
    } catch (actionError) {
      setError(actionError.message);
      throw actionError;
    }
  };

  return {
    customers, enquiries, products, inventory, orders, notice, error, loading,
    setError, setNotice, runAction,
  };
}
