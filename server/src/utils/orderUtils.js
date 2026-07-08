const processItems = (items) => {
  let totalAmount = 0;

  const processedItems = items.map((item, index) => {
    const quantity = Number(item.quantity || 1);

    const unitPrice = Number(item.unitPrice);

    const subtotal = quantity * unitPrice;

    totalAmount += subtotal;

    return {
      itemNumber: index + 1,

      garmentType: item.garmentType,

      quantity,

      unitPrice,

      subtotal,

      measurements: item.measurements || [],

      fabricImageUrl: item.fabricImageUrl || "",

      note: item.note || "",

      isUrgent: item.isUrgent || false,

      status: item.status || "Pending",

      isCuttingCompleted:
        item.isCuttingCompleted || false,
    };
  });

  return {
    processedItems,
    totalAmount,
  };
};

module.exports = {
  processItems,
};