import { getUserOnServer } from "../supabase/supabaseServer.js";
import { UnAuthenticatedError } from "../errors/index.js";

const auth = async (req, res, next) => {
  const userOnServer = await getUserOnServer(req, res);
  if (!userOnServer) {
    throw new UnAuthenticatedError("Authentication Invalid");
  }
  req.user = { ...userOnServer };
  next();
};

export default auth;
