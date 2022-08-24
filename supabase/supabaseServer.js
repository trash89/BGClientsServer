import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getUserOnServer(req, res) {
  try {
    const { user, error: errorUser } = await supabase.auth.api.getUserByCookie(req, res);
    if (errorUser) {
      console.log("getUserOnServer,errorUser=", errorUser);
      return null;
    }
    try {
      const { data: localUser, error: errorLocalUser } = await supabase.from("localusers").select("id,user_id,isAdmin").eq("user_id", user.id).single();
      if (errorLocalUser) {
        console.log("getUserOnServer,errorLocalUser=", errorLocalUser);
        return null;
      }
      return { ...user, isAdmin: localUser.isAdmin };
    } catch (error) {
      console.log(error);
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}
