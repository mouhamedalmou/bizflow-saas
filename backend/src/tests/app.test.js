const request = require("supertest");

describe("Basic API Test", () => {
  it("should return API running message", async () => {
    const response = await request("http://localhost:5000")
      .get("/");

    expect(response.statusCode).toBe(200);
  });
});