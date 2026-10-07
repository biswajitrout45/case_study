const { quotations } = require("../data/store");
const { validateQuotation } = require("../Validators/QuotationValidator");
const { calculateQuotationTotals, generateQuotationNumber } = require("../Services/QuotationService");

const listQuotations = (req, res) => {
  res.status(200).json({ success: true, data: quotations });
};

const createQuotation = (req, res) => {
  const validationError = validateQuotation(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const totals = calculateQuotationTotals(req.body.items);
  const quotation = {
    id: `quotation_${Date.now()}`,
    quotationNumber: generateQuotationNumber(),
    customerName: req.body.customerName,
    status: "draft",
    items: req.body.items,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    createdAt: new Date().toISOString(),
  };

  quotations.unshift(quotation);
  return res.status(201).json({ success: true, data: quotation });
};

const updateQuotation = (req, res) => {
  const quotation = quotations.find((entry) => entry.id === req.params.id);
  if (!quotation) {
    return res.status(404).json({ success: false, message: "Quotation not found" });
  }

  Object.assign(quotation, req.body, {
    total: req.body.total || quotation.total,
    updatedAt: new Date().toISOString(),
  });

  return res.status(200).json({ success: true, data: quotation });
};

module.exports = { listQuotations, createQuotation, updateQuotation };
