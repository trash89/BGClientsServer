import { useState, useEffect } from "react";
import { useIsMounted } from "../hooks";
//localhost:3000/passwordReset#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjYyNDQxNTg5LCJzdWIiOiJiODk0ZDY4NC0wODk2LTQ0NDUtYTA3NS0yOGVlZjJlNGUxMzYiLCJlbWFpbCI6Im1yODlAbGFwb3N0ZS5uZXQiLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7fSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJzZXNzaW9uX2lkIjoiMGU3ODRhMTEtM2MzNi00MTg2LTk3YTMtNTE0OGE2NDlmZDE4In0.GXw8qzKozs8Lrmq4YhV2AphTUOZkA_7d4ZOLoVrEk6c&expires_in=3600&refresh_token=d1Y-f85J7mClFKgsgf90ZQ&token_type=bearer&type=recovery

function PasswordReset() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState(null);
  const [error, setError] = useState(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    setHash(window.location.hash);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if the user doesn't have accesstoken
  };

  if (!isMounted) return <></>;

  if (!hash) {
    setError("Sorry, Invalid token");
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
      setError("Invalid access token or type");
    }
  }
  return (
    <section className="container p-2 my-2 border border-primary rounded-3">
      <p className="h6">Changing the password</p>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type="password" required value={password} placeholder="Please enter your Password" onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Submit</button>
      </form>
    </section>
  );
}

export default PasswordReset;
