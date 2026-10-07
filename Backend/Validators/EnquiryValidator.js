const validateEnquiry = (payload) => {
  const { customerId, items, requiredDate, enquiryDate } = payload || {};

  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return "A customer and at least one product are required";
  }

  if (items.some((item) => !item.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0)) {
    return "Each enquiry item must have a product and a positive whole-number quantity";
  }
  if (new Set(items.map((item) => String(item.productId))).size !== items.length) {
    return "A product can only appear once per enquiry";
  }

  if (requiredDate && enquiryDate && new Date(requiredDate) < new Date(enquiryDate)) {
    return "Required date cannot be before the enquiry date";
  }
  return null;
};

module.exports = { validateEnquiry };
