import { supabase } from "../supabase/supabaseServer.js";
import { UnAuthenticatedError } from "../errors/index.js";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthenticatedError("Authentication Invalid");
  }
  const access_token = authHeader.split(" ")[1];
  if (!access_token) {
    throw new UnAuthenticatedError("No token found");
  }
  try {
    const { user, error: errorUser } = await supabase.auth.api.getUser(access_token);
    if (errorUser) {
      //console.log(errorUser);
      throw new UnAuthenticatedError("Authentication Invalid");
    }
    try {
      const { data: localUser, error: errorLocalUser } = await supabase.from("localusers").select("id,user_id,isAdmin").eq("user_id", user.id).single();
      if (errorLocalUser) {
        //console.log("localusers,errorLocalUser=", errorLocalUser);
        throw new UnAuthenticatedError("Authentication Invalid");
      }
      const userOnServer = { ...user, isAdmin: localUser.isAdmin };
      req.user = { ...userOnServer };
      next();
    } catch (error) {
      //console.log(error);
      throw new UnAuthenticatedError("Authentication Invalid");
    }
  } catch (error) {
    //console.log(error);
    throw new UnAuthenticatedError("Authentication Invalid");
  }
};

export default auth;
