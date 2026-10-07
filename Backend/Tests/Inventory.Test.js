const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");

const server = app.listen(0);
const { port } = server.address();
const baseUrl = `http://localhost:${port}`;

test("inventory route works when authenticated", async () => {
  const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Inventory Admin",
      email: "inventory-admin@example.com",
      password: "TestPass123",
    }),
  });

  assert.equal(registerResponse.status, 201);
  const registerBody = await registerResponse.json();
  assert.equal(registerBody.user.role, "admin");

  const response = await fetch(`${baseUrl}/api/inventory`, {
    headers: { Authorization: `Bearer ${registerBody.token}` },
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.equal(body.data.length >= 6, true);
  assert.equal(body.data[0].availableQuantity, body.data[0].physicalQuantity - body.data[0].reservedQuantity);
});

test.after(() => server.close());
