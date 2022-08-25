import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const cookieOpts = {
  path: "/",
  maxAge: 60 * 60 * 6,
  //sameSite: "none",
  //secure: true,
  //httpOnly: true,
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: { message: "Please provide all values" } });
  }
  try {
    const { user, session, error } = await supabase.auth.signIn({ email, password });
    if (!user || error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error });
    }
    try {
      const { data: localUser, error: errorLocalUser } = await supabase.from("localusers").select("isAdmin").eq("user_id", user.id).single();
      if (errorLocalUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: errorLocalUser });
      }
      res.cookie("sb-access-token", session.access_token, cookieOpts);
      res.cookie("sb-refresh-token", session.refresh_token, cookieOpts);
      return res.status(StatusCodes.OK).json({ user: { ...user, isAdmin: localUser.isAdmin }, session });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.UNAUTHORIZED).json({ error });
    }
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.UNAUTHORIZED).json({ error });
  }
};
const verify = async (req, res) => {
  return res.status(StatusCodes.OK).json({ message: "verify" });
};
export { login, verify };
