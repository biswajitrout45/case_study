const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./Config/db");

const authRoutes = require("./Routes/AuthRoutes");
const customerRoutes = require("./Routes/CustomerRoutes");
const enquiryRoutes = require("./Routes/EnquiryRoutes");
const inventoryRoutes = require("./Routes/InventoryRoutes");
const productRoutes = require("./Routes/ProductRoutes");
const quotationRoutes = require("./Routes/QuotationRoutes");
const salesOrderRoutes = require("./Routes/SalesOrderRoutes");
const dispatchRoutes = require("./Routes/DispatchRoutes");

const errorMiddleware = require("./Middleware/ErrorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ERP Backend API is running",
  });
});


app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    return res.json({
      status: "success",
      message: "Server and database are connected",
      time: result.rows[0].now,
    });

  } catch (error) {
    console.error("Database health check error:", error);

    return res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});


app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/enquiries", enquiryRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/products", productRoutes);

app.use("/api/quotations", quotationRoutes);

app.use("/api/sales-orders", salesOrderRoutes);

app.use("/api/dispatch", dispatchRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}


module.exports = app;