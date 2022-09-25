import request from "supertest";
let access_token = null;
request("http://localhost:5000")
  .post("/api/v1/auth/login")
  .send({ email: "demo@demo.com", password: "secret123" })
  .end(function (err, res) {
    if (err) throw err;
    console.log("body=", res.body);
    access_token = res.body.session.access_token;
  });
console.log(access_token);
