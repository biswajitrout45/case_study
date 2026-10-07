const pool = require("../Config/db");
const { products, inventory, createId } = require("../data/store");
const { ensureCatalogSeeded, listProducts } = require("../Services/CatalogService");

const getProducts = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, data: await listProducts() });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { productCode, name, category, unit, basePrice } = req.body || {};
    const price = Number(basePrice);
    if (!productCode?.trim() || !name?.trim() || !category?.trim() || !unit?.trim()
      || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({ success: false, message: "Product code, name, category, unit, and a non-negative base price are required" });
    }

    if (pool) {
      await ensureCatalogSeeded();
      const result = await pool.query(
        `WITH new_product AS (
           INSERT INTO products (product_code, name, category, unit, base_price)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, product_code AS "productCode", name, category, unit, base_price AS "basePrice"
         ), new_inventory AS (
           INSERT INTO inventory (product_id) SELECT id FROM new_product RETURNING id AS "inventoryId"
         )
         SELECT new_product.*, new_inventory."inventoryId", 0 AS "physicalQuantity",
                0 AS "reservedQuantity", 0 AS "availableQuantity"
         FROM new_product CROSS JOIN new_inventory`,
        [productCode.trim(), name.trim(), category.trim(), unit.trim(), price],
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    if (products.some((product) => product.productCode.toLowerCase() === productCode.trim().toLowerCase())) {
      return res.status(409).json({ success: false, message: "Product code already exists" });
    }
    const product = {
      id: createId("product"),
      productCode: productCode.trim(),
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      basePrice: price,
    };
    products.push(product);
    inventory.push({
      id: createId("inventory"),
      productId: product.id,
      physicalQuantity: 0,
      reservedQuantity: 0,
    });
    return res.status(201).json({ success: true, data: { ...product, physicalQuantity: 0, reservedQuantity: 0, availableQuantity: 0 } });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Product code already exists" });
    }
    return next(error);
  }
};

module.exports = { getProducts, createProduct };
