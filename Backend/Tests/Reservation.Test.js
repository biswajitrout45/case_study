const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");

const server = app.listen(0);
const { port } = server.address();
const baseUrl = `http://localhost:${port}`;

const post = async (path, token, payload) => fetch(`${baseUrl}/api${path}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify(payload),
});

test("simultaneous confirmations never reserve more than available stock", async () => {
  const register = await post("/auth/register", "", {
    name: "Reservation Admin",
    email: "reservation-admin@example.com",
    password: "TestPass123",
  });
  assert.equal(register.status, 201);
  const { token } = await register.json();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const productResponse = await fetch(`${baseUrl}/api/products`, { headers });
  const productBody = await productResponse.json();
  const product = productBody.data.find((entry) => entry.productCode === "IND-A");
  const productB = productBody.data.find((entry) => entry.productCode === "IND-B");
  assert.ok(product);
  assert.ok(productB);

  const stockResponse = await fetch(`${baseUrl}/api/inventory/${product.inventoryId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ physicalQuantity: 160 }),
  });
  assert.equal(stockResponse.status, 200);
  assert.equal((await stockResponse.json()).data.availableQuantity, 100);

  const customerResponse = await post("/customers", token, {
    companyName: "Race Condition Test Ltd",
    contactPerson: "Test Buyer",
    mobile: "9000000000",
  });
  assert.equal(customerResponse.status, 201);
  const { data: customer } = await customerResponse.json();

  const createOrder = async (selectedProduct, quantity) => {
    const enquiryResponse = await post("/enquiries", token, {
      customerId: customer.id,
      items: [{ productId: selectedProduct.id, quantity }],
    });
    assert.equal(enquiryResponse.status, 201);
    const { data: enquiry } = await enquiryResponse.json();
    const orderResponse = await post("/sales-orders", token, { enquiryId: enquiry.id });
    assert.equal(orderResponse.status, 201);
    return (await orderResponse.json()).data;
  };

  const [order80, order50] = await Promise.all([
    createOrder(product, 80),
    createOrder(product, 50),
  ]);
  const confirm = (order) => fetch(`${baseUrl}/api/sales-orders/${order.id}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "CONFIRMED" }),
  });
  const results = await Promise.all([confirm(order80), confirm(order50)]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);

  const inventoryResponse = await fetch(`${baseUrl}/api/inventory`, { headers });
  const inventoryBody = await inventoryResponse.json();
  const finalStock = inventoryBody.data.find((entry) => entry.productCode === "IND-A");
  assert.equal(finalStock.physicalQuantity, 160);
  assert.equal(finalStock.availableQuantity, 100 - (results[0].status === 200 ? 80 : 50));
  assert.ok(finalStock.reservedQuantity <= finalStock.physicalQuantity);
  const winningOrder = results[0].status === 200 ? order80 : order50;
  const enquiryList = await (await fetch(`${baseUrl}/api/enquiries`, { headers })).json();
  assert.equal(enquiryList.data.find((entry) => entry.id === winningOrder.enquiryId).status, "WON");

  const invalidUpdate = await fetch(`${baseUrl}/api/inventory/${product.inventoryId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ physicalQuantity: -1 }),
  });
  assert.equal(invalidUpdate.status, 400);

  const reservedUpdate = await fetch(`${baseUrl}/api/inventory/${product.inventoryId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ physicalQuantity: 160, reservedQuantity: 0 }),
  });
  assert.equal(reservedUpdate.status, 400);

  const order80OnB = await createOrder(productB, 80);
  const insufficient = await confirm(order80OnB);
  assert.equal(insufficient.status, 409);

  const order60OnB = await createOrder(productB, 60);
  const accepted = await confirm(order60OnB);
  assert.equal(accepted.status, 200);
  const inventoryAfterB = await (await fetch(`${baseUrl}/api/inventory`, { headers })).json();
  const finalProductB = inventoryAfterB.data.find((entry) => entry.productCode === "IND-B");
  assert.equal(finalProductB.physicalQuantity, 100);
  assert.equal(finalProductB.reservedQuantity, 90);
  assert.equal(finalProductB.availableQuantity, 10);

  const underReservedStock = await fetch(`${baseUrl}/api/inventory/${productB.inventoryId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ physicalQuantity: 89 }),
  });
  assert.equal(underReservedStock.status, 400);
});

test.after(() => server.close());
