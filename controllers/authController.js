import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

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
      return res.status(StatusCodes.OK).json({
        user: { id: user.id, email: user.email, isAdmin: localUser.isAdmin },
        session: { access_token: session.access_token, refresh_token: session.refresh_token },
      });
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error });
    }
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error });
  }
};
export { login };
