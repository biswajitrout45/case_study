const pool = require("../Config/db");
const { products, inventory } = require("../data/store");

const sampleProducts = [
  { productCode: "IND-A", name: "Industrial Product A", category: "Pumps & Valves", unit: "pcs", basePrice: 1250, physicalQuantity: 200, reservedQuantity: 60 },
  { productCode: "IND-B", name: "Industrial Product B", category: "Bearings", unit: "pcs", basePrice: 840, physicalQuantity: 100, reservedQuantity: 30 },
  { productCode: "IND-C", name: "Industrial Product C", category: "Hydraulics", unit: "pcs", basePrice: 2150, physicalQuantity: 300, reservedQuantity: 0 },
  { productCode: "IND-D", name: "Centrifugal Pump 2HP", category: "Pumps & Valves", unit: "pcs", basePrice: 18600, physicalQuantity: 45, reservedQuantity: 5 },
  { productCode: "IND-E", name: "Taper Roller Bearing", category: "Bearings", unit: "pcs", basePrice: 975, physicalQuantity: 500, reservedQuantity: 80 },
  { productCode: "IND-F", name: "Hydraulic Hose 1m", category: "Hydraulics", unit: "m", basePrice: 620, physicalQuantity: 750, reservedQuantity: 125 },
];

let seedPromise;

const ensureCatalogSeeded = async () => {
  if (!pool) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      for (const product of sampleProducts) {
        await pool.query(
          "INSERT INTO products (product_code, name, category, unit, base_price) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (product_code) DO NOTHING",
          [product.productCode, product.name, product.category, product.unit, product.basePrice],
        );
        await pool.query(
          `INSERT INTO inventory (product_id, physical_quantity, reserved_quantity)
           SELECT id, $2, $3 FROM products WHERE product_code = $1
           ON CONFLICT (product_id) DO NOTHING`,
          [product.productCode, product.physicalQuantity, product.reservedQuantity],
        );
      }
    })().catch((error) => {
      seedPromise = undefined;
      throw error;
    });
  }
  await seedPromise;
};

const listProducts = async () => {
  if (pool) {
    await ensureCatalogSeeded();
    const result = await pool.query(
      `SELECT p.id, p.product_code AS "productCode", p.name, p.category, p.unit,
              p.base_price AS "basePrice",
              i.id AS "inventoryId", i.physical_quantity AS "physicalQuantity",
              i.reserved_quantity AS "reservedQuantity",
              i.physical_quantity - i.reserved_quantity AS "availableQuantity"
       FROM products p JOIN inventory i ON i.product_id = p.id
       ORDER BY p.product_code`,
    );
    return result.rows;
  }

  return products.map((product) => {
    const stock = inventory.find((item) => item.productId === product.id);
    return {
      ...product,
      inventoryId: stock?.id,
      physicalQuantity: stock?.physicalQuantity ?? 0,
      reservedQuantity: stock?.reservedQuantity ?? 0,
      availableQuantity: (stock?.physicalQuantity ?? 0) - (stock?.reservedQuantity ?? 0),
    };
  });
};

module.exports = { ensureCatalogSeeded, listProducts, sampleProducts };
