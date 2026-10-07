const { inventory, products } = require("../data/store");

const calculateStockValue = (items = inventory) => items.reduce((total, item) => {
  const product = products.find((entry) => entry.id === item.productId);
  const price = product?.basePrice ?? item.basePrice ?? item.unitPrice ?? 0;
  return total + (item.physicalQuantity * price);
}, 0);

const getLowStockItems = (items = inventory) => items.filter((item) => {
  const available = item.physicalQuantity - item.reservedQuantity;
  return available <= (item.reorderLevel ?? 0);
});

const updateInventoryItem = (itemId, changes) => {
  const item = inventory.find((entry) => entry.id === itemId);

  if (!item) {
    return null;
  }

  const physicalQuantity = Number(changes.physicalQuantity);
  if (!Number.isInteger(physicalQuantity) || physicalQuantity < item.reservedQuantity) {
    return { error: "Physical quantity must be a non-negative integer at least as large as the reserved quantity" };
  }

  item.physicalQuantity = physicalQuantity;
  item.updatedAt = new Date().toISOString();
  return item;
};

module.exports = { calculateStockValue, getLowStockItems, updateInventoryItem };
