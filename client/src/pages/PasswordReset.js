import React, { useState, useEffect } from "react";

function PasswordReset() {
  const [password, setPassword] = useState(null);

  const [hash, setHash] = useState(null);

  useEffect(() => {
    setHash(window.location.hash);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if the user doesn't have accesstoken
    if (!hash) {
      return console.error("Sorry, Invalid token");
    } else if (hash) {
      const hashArr = hash
        .substring(1)
        .split("&")
        .map((param) => param.split("="));

      let type;
      let accessToken;
      for (const [key, value] of hashArr) {
        if (key === "type") {
          type = value;
        } else if (key === "access_token") {
          accessToken = value;
        }
      }

      if (type !== "recovery" || !accessToken || typeof accessToken === "object") {
        console.error("Invalid access token or type");
        return;
      }

      //   now we will change the password

      console.success("Password Changed");
    }
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type="password" required value={password} placeholder="Please enter your Password" onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default PasswordReset;
