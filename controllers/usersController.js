import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnAuthenticatedError } from "../errors/index.js";
import moment from "moment";
import { supabase, getUserOnServer } from "../supabase/supabaseServer.js";

const getAllUsers = async (req, res) => {
  const { data: user, error } = await supabase.auth.api.listUsers();

  res.status(StatusCodes.OK).json({ users: user });
};

export { getAllUsers };
