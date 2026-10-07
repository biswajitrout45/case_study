const validateQuotation = (payload) => {
  const { customerName, items } = payload || {};

  if (!customerName || !Array.isArray(items) || items.length === 0) {
    return "Customer name and at least one quotation item are required";
  }

  const invalidItem = items.some((item) => !item.name || !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0);
  if (invalidItem) {
    return "Each quotation item must include name, quantity, and unitPrice";
  }

  return null;
};

module.exports = { validateQuotation };
