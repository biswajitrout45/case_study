const generateDispatchNumber = () => `DSP-${Date.now()}`;

const updateDispatchStatus = (dispatches, dispatchId, status) => {
  const dispatch = dispatches.find((entry) => entry.id === dispatchId);

  if (!dispatch) {
    return null;
  }

  dispatch.status = status;
  return dispatch;
};

module.exports = { generateDispatchNumber, updateDispatchStatus };
