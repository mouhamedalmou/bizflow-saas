const request = require("supertest");
process.env.NODE_ENV = "test";
const { app } = require("../../dist/server.js");

describe("Basic API Test", () => {
  it("should return API running message", async () => {
    const response = await request(app).get("/api");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
