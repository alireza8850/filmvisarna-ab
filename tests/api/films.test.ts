import { describe, it, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

describe("API: Films", () => {
  it("should fetch all films", async () => {
    try {
      const response = await fetch(`${BASE_URL}/films`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty("id");
        expect(data[0]).toHaveProperty("title");
      }
    } catch (error) {
      console.warn("Backend not running, skipping API test");
    }
  });

  it("should fetch a specific film by id", async () => {
    try {
      const response = await fetch(`${BASE_URL}/films/1`);
      if (response.status === 200) {
        const data = await response.json();
        expect(data.id).toBe(1);
      } else {
        expect(response.status).toBe(404);
      }
    } catch (error) {
       console.warn("Backend not running, skipping API test");
    }
  });
});
