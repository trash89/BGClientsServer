import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnAuthenticatedError } from "../errors/index.js";
import moment from "moment";

const getAllUsers = async (req, res) => {
  res.status(StatusCodes.OK).json({ users: "allusers" });
};

export { getAllUsers };
