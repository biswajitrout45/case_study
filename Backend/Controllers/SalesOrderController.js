const pool = require("../Config/db");
const { salesOrders, enquiries, customers, products, inventory, createId } = require("../data/store");

const listOrders = async (req, res, next) => {
  try {
    if (pool) {
      const result = await pool.query(
        `SELECT so.id, so.order_number AS "orderNumber", so.customer_id AS "customerId",
                q.enquiry_id AS "enquiryId",
                c.company_name AS "customerName", so.total_amount AS total, so.status,
                so.created_at AS "createdAt",
                COALESCE(
                  json_agg(json_build_object(
                    'productId', soi.product_id,
                    'productName', p.name,
                    'productCode', p.product_code,
                    'quantity', soi.quantity,
                    'unitPrice', soi.unit_price
                  )) FILTER (WHERE soi.id IS NOT NULL), '[]'
                ) AS items
         FROM sales_orders so
         JOIN customers c ON c.id = so.customer_id
         JOIN quotations q ON q.id = so.quotation_id
         LEFT JOIN sales_order_items soi ON soi.sales_order_id = so.id
         LEFT JOIN products p ON p.id = soi.product_id
         GROUP BY so.id, c.id, q.enquiry_id
         ORDER BY so.created_at DESC`,
      );
      return res.status(200).json({ success: true, data: result.rows });
    }
    return res.status(200).json({ success: true, data: salesOrders });
  } catch (error) {
    return next(error);
  }
};

const createSalesOrder = async (req, res, next) => {
  try {
    const { enquiryId } = req.body || {};
    if (!enquiryId) {
      return res.status(400).json({ success: false, message: "An enquiry is required to create a sales order" });
    }

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const enquiryResult = await client.query(
          `SELECT e.id, e.customer_id AS "customerId", c.company_name AS "customerName"
           FROM enquiries e JOIN customers c ON c.id = e.customer_id WHERE e.id = $1`,
          [enquiryId],
        );
        if (!enquiryResult.rowCount) {
          await client.query("ROLLBACK");
          return res.status(404).json({ success: false, message: "Enquiry not found" });
        }
        const itemsResult = await client.query(
          `SELECT ei.product_id AS "productId", p.name AS "productName", p.product_code AS "productCode",
                  ei.quantity, p.base_price AS "unitPrice"
           FROM enquiry_items ei JOIN products p ON p.id = ei.product_id
           WHERE ei.enquiry_id = $1 ORDER BY ei.product_id`,
          [enquiryId],
        );
        if (!itemsResult.rowCount) {
          await client.query("ROLLBACK");
          return res.status(400).json({ success: false, message: "The enquiry has no product items" });
        }
        const { customerId, customerName } = enquiryResult.rows[0];
        const items = itemsResult.rows;
        const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
        const gst = subtotal * 0.18;
        let quotationResult = await client.query(
          "SELECT id FROM quotations WHERE enquiry_id = $1",
          [enquiryId],
        );
        let quotationId;
        if (quotationResult.rowCount) {
          quotationId = quotationResult.rows[0].id;
        } else {
          const quotationNumber = `QTN-${Date.now()}-${Math.random().toString(16).slice(2, 5).toUpperCase()}`;
          quotationResult = await client.query(
            `INSERT INTO quotations
               (quotation_number, enquiry_id, customer_id, status, subtotal, gst_amount, grand_total, created_by)
             VALUES ($1, $2, $3, 'ACCEPTED', $4, $5, $6, $7) RETURNING id`,
            [quotationNumber, enquiryId, customerId, subtotal, gst, subtotal + gst, req.user.id],
          );
          quotationId = quotationResult.rows[0].id;
          for (const item of items) {
            const lineAmount = Number(item.quantity) * Number(item.unitPrice) * 1.18;
            await client.query(
              `INSERT INTO quotation_items
                 (quotation_id, product_id, quantity, unit_price, line_amount)
               VALUES ($1, $2, $3, $4, $5)`,
              [quotationId, item.productId, item.quantity, item.unitPrice, lineAmount],
            );
          }
        }

        const orderNumber = `SO-${Date.now()}-${Math.random().toString(16).slice(2, 5).toUpperCase()}`;
        const orderResult = await client.query(
          `INSERT INTO sales_orders (order_number, customer_id, quotation_id, total_amount, status, created_by)
           VALUES ($1, $2, $3, $4, 'PENDING', $5) RETURNING id, created_at AS "createdAt"`,
          [orderNumber, customerId, quotationId, subtotal + gst, req.user.id],
        );
        const orderId = orderResult.rows[0].id;
        for (const item of items) {
          await client.query(
            `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4)`,
            [orderId, item.productId, item.quantity, item.unitPrice],
          );
        }
        await client.query("UPDATE enquiries SET status = 'QUOTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [enquiryId]);
        await client.query("COMMIT");
        return res.status(201).json({
          success: true,
          data: {
            id: orderId,
            orderNumber,
            enquiryId,
            customerId,
            customerName,
            total: subtotal + gst,
            status: "PENDING",
            items,
            createdAt: orderResult.rows[0].createdAt,
          },
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    const enquiry = enquiries.find((entry) => entry.id === String(enquiryId));
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    const customer = customers.find((entry) => entry.id === enquiry.customerId);
    const items = enquiry.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || item.productName,
        productCode: product?.productCode || item.productCode,
        quantity: Number(item.quantity),
        unitPrice: Number(product?.basePrice || 0),
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const order = {
      id: createId("sales_order"),
      orderNumber: `SO-${Date.now()}`,
      enquiryId: enquiry.id,
      customerId: enquiry.customerId,
      customerName: customer?.companyName || customer?.company || "Customer",
      total: subtotal * 1.18,
      status: "PENDING",
      items,
      createdAt: new Date().toISOString(),
    };
    salesOrders.unshift(order);
    enquiry.status = "QUOTED";
    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const status = String(req.body?.status || "").toUpperCase();
    if (status !== "CONFIRMED") {
      return res.status(400).json({ success: false, message: "Only order confirmation is supported here" });
    }

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const orderResult = await client.query(
          "SELECT id, status FROM sales_orders WHERE id = $1 FOR UPDATE",
          [req.params.id],
        );
        if (!orderResult.rowCount) {
          await client.query("ROLLBACK");
          return res.status(404).json({ success: false, message: "Sales order not found" });
        }
        if (orderResult.rows[0].status !== "PENDING") {
          await client.query("ROLLBACK");
          return res.status(409).json({ success: false, message: "Only pending sales orders can be confirmed" });
        }
        const itemResult = await client.query(
          `SELECT product_id AS "productId", quantity, p.name AS "productName"
           FROM sales_order_items soi JOIN products p ON p.id = soi.product_id
           WHERE sales_order_id = $1 ORDER BY product_id`,
          [req.params.id],
        );
        for (const item of itemResult.rows) {
          const reserved = await client.query(
            `UPDATE inventory
             SET reserved_quantity = reserved_quantity + $1, updated_at = CURRENT_TIMESTAMP
             -- PostgreSQL rechecks this predicate against the latest row after a competing update.
             WHERE product_id = $2 AND physical_quantity - reserved_quantity >= $1
             RETURNING physical_quantity AS "physicalQuantity",
                       reserved_quantity AS "reservedQuantity"`,
            [item.quantity, item.productId],
          );
          if (!reserved.rowCount) {
            await client.query("ROLLBACK");
            return res.status(409).json({
              success: false,
              message: `Insufficient available stock for ${item.productName}; the order was not confirmed`,
            });
          }
        }
        const updated = await client.query(
          `UPDATE sales_orders SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1
           RETURNING id, order_number AS "orderNumber", status, quotation_id AS "quotationId"`,
          [req.params.id],
        );
        await client.query(
          `UPDATE enquiries SET status = 'WON', updated_at = CURRENT_TIMESTAMP
           WHERE id = (SELECT enquiry_id FROM quotations WHERE id = $1)`,
          [updated.rows[0].quotationId],
        );
        await client.query("COMMIT");
        const { quotationId, ...order } = updated.rows[0];
        return res.status(200).json({ success: true, data: order });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    const order = salesOrders.find((entry) => entry.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Sales order not found" });
    }
    if (order.status !== "PENDING") {
      return res.status(409).json({ success: false, message: "Only pending sales orders can be confirmed" });
    }

    const reservations = [];
    for (const item of order.items) {
      const stock = inventory.find((entry) => entry.productId === item.productId);
      const available = stock ? stock.physicalQuantity - stock.reservedQuantity : 0;
      if (!stock || available < item.quantity) {
        const product = products.find((entry) => entry.id === item.productId);
        return res.status(409).json({
          success: false,
          message: `Insufficient available stock for ${product?.name || item.productName}; the order was not confirmed`,
        });
      }
      reservations.push({ stock, quantity: Number(item.quantity) });
    }
    reservations.forEach(({ stock, quantity }) => {
      stock.reservedQuantity += quantity;
    });
    order.status = "CONFIRMED";
    const enquiry = enquiries.find((entry) => entry.id === order.enquiryId);
    if (enquiry) enquiry.status = "WON";
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listOrders, createSalesOrder, updateOrderStatus };
