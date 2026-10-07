const { enquiries, products, customers } = require("../data/store");
const { validateEnquiry } = require("../Validators/EnquiryValidator");
const pool = require("../Config/db");

const listEnquiries = async (req, res, next) => {
  try {
    if (pool) {
      const result = await pool.query(
        `SELECT e.id, e.enquiry_number AS "enquiryNumber", e.customer_id AS "customerId",
                c.company_name AS "companyName", c.contact_person AS "contactPerson",
                c.mobile, c.email, c.city, e.enquiry_date AS "enquiryDate",
                e.required_date AS "requiredDate", e.notes, e.status,
                COALESCE(
                  json_agg(json_build_object(
                    'productId', ei.product_id,
                    'productCode', p.product_code,
                    'productName', p.name,
                    'quantity', ei.quantity
                  )) FILTER (WHERE ei.id IS NOT NULL), '[]'
                ) AS items,
                e.created_at AS "createdAt"
         FROM enquiries e
         JOIN customers c ON c.id = e.customer_id
         LEFT JOIN enquiry_items ei ON ei.enquiry_id = e.id
         LEFT JOIN products p ON p.id = ei.product_id
         GROUP BY e.id, c.id
         ORDER BY e.created_at DESC`,
      );
      return res.status(200).json({ success: true, data: result.rows });
    }
    const data = enquiries.map((enquiry) => {
      const customer = customers.find((entry) => String(entry.id) === String(enquiry.customerId));
      return {
        ...enquiry,
        companyName: customer?.companyName,
        contactPerson: customer?.contactPerson,
        mobile: customer?.mobile,
        email: customer?.email,
        city: customer?.city,
        items: enquiry.items.map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return { ...item, productName: product?.name, productCode: product?.productCode };
        }),
      };
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const createEnquiry = async (req, res, next) => {
  try {
    const validationError = validateEnquiry(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { customerId, enquiryDate, requiredDate, notes = "", items } = req.body;
    const enquiryNumber = `ENQ-${Date.now()}-${Math.random().toString(16).slice(2, 5).toUpperCase()}`;
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const created = await client.query(
          `INSERT INTO enquiries (enquiry_number, customer_id, enquiry_date, required_date, notes, status, created_by)
           VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5, 'NEW', $6)
           RETURNING id`,
          [enquiryNumber, customerId, enquiryDate || null, requiredDate || null, notes, req.user.id],
        );
        for (const item of items) {
          await client.query(
            "INSERT INTO enquiry_items (enquiry_id, product_id, quantity) VALUES ($1, $2, $3)",
            [created.rows[0].id, item.productId, Number(item.quantity)],
          );
        }
        await client.query("COMMIT");
        return res.status(201).json({
          success: true,
          data: { id: created.rows[0].id, enquiryNumber, customerId, enquiryDate, requiredDate, notes, items, status: "NEW" },
        });
      } catch (error) {
        await client.query("ROLLBACK");
        if (error.code === "23503") {
          return res.status(400).json({ success: false, message: "Customer or product does not exist" });
        }
        if (error.code === "23505") {
          return res.status(400).json({ success: false, message: "A product can only appear once per enquiry" });
        }
        throw error;
      } finally {
        client.release();
      }
    }

    if (!customers.some((customer) => String(customer.id) === String(customerId))) {
      return res.status(400).json({ success: false, message: "Customer does not exist" });
    }
    if (items.some((item) => !products.some((product) => String(product.id) === String(item.productId)))) {
      return res.status(400).json({ success: false, message: "A selected product does not exist" });
    }

    const enquiry = {
      id: `enquiry_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      enquiryNumber,
      customerId,
      enquiryDate: enquiryDate || new Date().toISOString().slice(0, 10),
      requiredDate: requiredDate || "",
      notes,
      items: items.map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return {
          ...item,
          quantity: Number(item.quantity),
          productName: product?.name,
          productCode: product?.productCode,
        };
      }),
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
    enquiries.unshift(enquiry);
    return res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    return next(error);
  }
};

const updateEnquiryStatus = async (req, res, next) => {
  if (pool) {
    try {
      const status = String(req.body.status || "").toUpperCase();
      if (!["NEW", "QUOTED", "WON", "LOST"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be NEW, QUOTED, WON, or LOST" });
      }
      const result = await pool.query(
        `UPDATE enquiries SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING id, enquiry_number AS "enquiryNumber", status`,
        [status, req.params.id],
      );
      if (!result.rowCount) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
      }
      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      return next(error);
    }
  }
  const enquiry = enquiries.find((entry) => entry.id === req.params.id);
  if (!enquiry) {
    return res.status(404).json({ success: false, message: "Enquiry not found" });
  }

  const status = String(req.body.status || "").toUpperCase();
  if (!["NEW", "QUOTED", "WON", "LOST"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be NEW, QUOTED, WON, or LOST" });
  }
  enquiry.status = status;
  return res.status(200).json({ success: true, data: enquiry });
};

module.exports = { listEnquiries, createEnquiry, updateEnquiryStatus };
