const calculateQuotationTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return { subtotal, tax, total };
};

const generateQuotationNumber = () => `QTN-${Date.now()}`;

module.exports = { calculateQuotationTotals, generateQuotationNumber };
