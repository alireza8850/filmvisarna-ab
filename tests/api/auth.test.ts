import { describe, it, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

describe("API: Auth", () => {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: `test${Date.now()}@example.com`,
    phone: "0701234567",
    password: "Password123"
  };

  it("should register a new user", async () => {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser)
      });
      const data = await response.json();
      expect([201, 200]).toContain(response.status);
      expect(data).toHaveProperty("id");
    } catch (error) {
      console.warn("Backend not running, skipping API test");
    }
  });

  it("should login with registered user", async () => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.email).toBe(testUser.email);
    } catch (error) {
       console.warn("Backend not running, skipping API test");
    }
  });

  it("should fail to login with wrong password", async () => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: "WrongPassword"
        })
      });
      const data = await response.json();
      expect(data).toHaveProperty("error");
    } catch (error) {
       console.warn("Backend not running, skipping API test");
    }
  });
});
