import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors/index.js";

// const register = async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     throw new BadRequestError("please provide all values");
//   }
//   const userAlreadyExists = await User.findOne({ email });
//   if (userAlreadyExists) {
//     throw new BadRequestError("Email already in use");
//   }
//   const user = await User.create({ name, email, password });

//   const token = user.createJWT();
//   res.status(StatusCodes.CREATED).json({
//     user: {
//       email: user.email,
//       lastName: user.lastName,
//       location: user.location,
//       name: user.name,
//     },
//     token,
//     location: user.location,
//   });
// };
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide all values");
  }
  const { user, session, error } = await supabase.auth.signIn({ email, password });
  if (!user) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }
  if (error) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }
  const { data: localUser, error: errorLocalUser } = await supabase.from("localusers").select("isAdmin").eq("user_id", user.id).single();
  res.cookie("sb-access-token", session.access_token, { path: "/", maxAge: 60 * 60 * 6, sameSite: "lax" });
  res.cookie("sb-refresh-token", session.refresh_token, { path: "/", maxAge: 60 * 60 * 6, sameSite: "lax" });
  res.status(StatusCodes.OK).json({ user: { ...user, isAdmin: localUser.isAdmin }, session });
};

export {
  //register,
  login,
};
