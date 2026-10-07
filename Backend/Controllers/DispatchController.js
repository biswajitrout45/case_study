const { dispatches } = require("../data/store");
const { generateDispatchNumber, updateDispatchStatus } = require("../Services/DispatchService");

const listDispatches = (req, res) => {
  res.status(200).json({ success: true, data: dispatches });
};

const createDispatch = (req, res) => {
  const { salesOrderId, address } = req.body || {};

  if (!salesOrderId || !address) {
    return res.status(400).json({ success: false, message: "Sales order id and address are required" });
  }

  const dispatch = {
    id: `dispatch_${Date.now()}`,
    dispatchNumber: generateDispatchNumber(),
    salesOrderId,
    address,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };

  dispatches.unshift(dispatch);
  return res.status(201).json({ success: true, data: dispatch });
};

const updateDispatch = (req, res) => {
  const dispatch = updateDispatchStatus(dispatches, req.params.id, req.body.status || "scheduled");

  if (!dispatch) {
    return res.status(404).json({ success: false, message: "Dispatch not found" });
  }

  return res.status(200).json({ success: true, data: dispatch });
};

module.exports = { listDispatches, createDispatch, updateDispatch };
