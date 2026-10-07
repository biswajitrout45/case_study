const { inventory, products } = require("../data/store");
const { calculateStockValue, getLowStockItems, updateInventoryItem } = require("../Services/InventoryServices");
const pool = require("../Config/db");
const { ensureCatalogSeeded } = require("../Services/CatalogService");

const listInventory = async (req, res, next) => {
  try {
    let items = inventory;
    if (pool) {
      await ensureCatalogSeeded();
      const result = await pool.query(
        `SELECT i.id, i.product_id AS "productId", p.product_code AS "productCode",
                p.name, p.category, p.unit, p.base_price AS "basePrice",
                i.physical_quantity AS "physicalQuantity",
                i.reserved_quantity AS "reservedQuantity",
                i.physical_quantity - i.reserved_quantity AS "availableQuantity",
                i.updated_at AS "updatedAt"
         FROM inventory i JOIN products p ON p.id = i.product_id
         ORDER BY p.product_code`,
      );
      items = result.rows;
    } else {
      items = inventory.map((item) => ({
        ...item,
        ...products.find((product) => product.id === item.productId),
        availableQuantity: item.physicalQuantity - item.reservedQuantity,
      }));
    }
    return res.status(200).json({
      success: true,
      data: items,
      summary: {
        totalItems: items.length,
        totalValue: calculateStockValue(items),
        lowStock: getLowStockItems(items),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createInventoryItem = (req, res) => {
  return res.status(400).json({ success: false, message: "Create a product first; inventory is created with each product" });
};

const updateInventoryItemById = async (req, res, next) => {
  try {
    const { physicalQuantity } = req.body || {};
    if (!Number.isInteger(physicalQuantity) || physicalQuantity < 0) {
      return res.status(400).json({ success: false, message: "Physical quantity must be a non-negative integer" });
    }
    if (Object.hasOwn(req.body || {}, "reservedQuantity")) {
      return res.status(400).json({ success: false, message: "Reserved quantity can only be changed by confirming or cancelling an order" });
    }

    if (pool) {
      const result = await pool.query(
        `UPDATE inventory
         SET physical_quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND physical_quantity >= reserved_quantity
           AND $1 >= reserved_quantity
         RETURNING id, product_id AS "productId", physical_quantity AS "physicalQuantity",
                   reserved_quantity AS "reservedQuantity",
                   physical_quantity - reserved_quantity AS "availableQuantity",
                   updated_at AS "updatedAt"`,
        [physicalQuantity, req.params.id],
      );
      if (!result.rowCount) {
        const exists = await pool.query("SELECT id FROM inventory WHERE id = $1", [req.params.id]);
        if (!exists.rowCount) {
          return res.status(404).json({ success: false, message: "Inventory item not found" });
        }
        return res.status(400).json({ success: false, message: "Physical quantity cannot be lower than reserved quantity" });
      }
      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    const item = updateInventoryItem(req.params.id, { physicalQuantity });
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    if (item.error) {
      return res.status(400).json({ success: false, message: item.error });
    }
    return res.status(200).json({
      success: true,
      data: { ...item, availableQuantity: item.physicalQuantity - item.reservedQuantity },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listInventory, createInventoryItem, updateInventoryItemById };
