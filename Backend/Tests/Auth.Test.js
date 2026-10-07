const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");

const server = app.listen(0);
const { port } = server.address();
const baseUrl = `http://localhost:${port}`;

test("register and login flow succeeds", async () => {
  const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "testuser@example.com",
      password: "TestPass123",
      role: "sales",
    }),
  });

  assert.equal(registerResponse.status, 201);

  const registerBody = await registerResponse.json();
  assert.equal(registerBody.success, true);
  assert.equal(registerBody.user.role, "admin");
  assert.ok(registerBody.token);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      password: "TestPass123",
    }),
  });

  assert.equal(loginResponse.status, 200);

  const loginBody = await loginResponse.json();
  assert.equal(loginBody.success, true);
  assert.ok(loginBody.token);

  const secondAccountResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Second User",
      email: "seconduser@example.com",
      password: "TestPass123",
      role: "admin",
    }),
  });
  assert.equal(secondAccountResponse.status, 201);
  const secondAccount = await secondAccountResponse.json();
  assert.equal(secondAccount.user.role, "sales");
});

test.after(() => server.close());
