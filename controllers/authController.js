import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: { message: "Please provide all values" } });
  }
  const { user, session, error } = await supabase.auth.signIn({ email, password });
  if (!user || error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error });
  }
  const { data: localUser, error: errorLocalUser } = await supabase.from("localusers").select("isAdmin").eq("user_id", user.id).single();
  if (errorLocalUser) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: errorLocalUser });
  }
  res.cookie("sb-access-token", session.access_token, {
    path: "/",
    maxAge: 60 * 60 * 6,
    sameSite: "lax",
    sameSite: "none",
    secure: true,
    domain: "https://bg-clients.vercel.app",
    httpOnly: true,
  });
  res.cookie("sb-refresh-token", session.refresh_token, {
    path: "/",
    maxAge: 60 * 60 * 6,
    sameSite: "lax",
    sameSite: "none",
    secure: true,
    domain: "https://bg-clients.vercel.app",
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ user: { ...user, isAdmin: localUser.isAdmin }, session });
};

export {
  //register,
  login,
};
