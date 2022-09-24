import { assert, expect, should } from "chai";
import axios from "axios";

describe("Connect2", () => {
  let access_token = null;
  beforeEach(async () => {
    console.log("Connect to app2");
    const resp = await axios.post("http://localhost:5000/api/v1/auth/login", { email: "demo@demo.com", password: "secret123" });
    access_token = resp.data.session.access_token;
  });
  it("Connected, get session2", () => {
    assert.exists(access_token);
  });
});
