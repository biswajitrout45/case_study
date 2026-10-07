const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

const state = {
  users: [],
  customers: [],
  enquiries: [],
  products: [
    { id: "product_1", productCode: "IND-A", name: "Industrial Product A", category: "Pumps & Valves", unit: "pcs", basePrice: 1250 },
    { id: "product_2", productCode: "IND-B", name: "Industrial Product B", category: "Bearings", unit: "pcs", basePrice: 840 },
    { id: "product_3", productCode: "IND-C", name: "Industrial Product C", category: "Hydraulics", unit: "pcs", basePrice: 2150 },
    { id: "product_4", productCode: "IND-D", name: "Centrifugal Pump 2HP", category: "Pumps & Valves", unit: "pcs", basePrice: 18600 },
    { id: "product_5", productCode: "IND-E", name: "Taper Roller Bearing", category: "Bearings", unit: "pcs", basePrice: 975 },
    { id: "product_6", productCode: "IND-F", name: "Hydraulic Hose 1m", category: "Hydraulics", unit: "m", basePrice: 620 },
  ],
  inventory: [
    { id: "inventory_1", productId: "product_1", physicalQuantity: 200, reservedQuantity: 60 },
    { id: "inventory_2", productId: "product_2", physicalQuantity: 100, reservedQuantity: 30 },
    { id: "inventory_3", productId: "product_3", physicalQuantity: 300, reservedQuantity: 0 },
    { id: "inventory_4", productId: "product_4", physicalQuantity: 45, reservedQuantity: 5 },
    { id: "inventory_5", productId: "product_5", physicalQuantity: 500, reservedQuantity: 80 },
    { id: "inventory_6", productId: "product_6", physicalQuantity: 750, reservedQuantity: 125 },
  ],
  quotations: [],
  salesOrders: [],
  dispatches: [],
  createId,
};

module.exports = state;
