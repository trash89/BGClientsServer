import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnAuthenticatedError } from "../errors/index.js";

import { supabase, getUserOnServer } from "../supabase/supabaseServer.js";

const getAllUsers = async (req, res) => {
  const user = req.user;
  if (user.isAdmin) {
    const { data: users, error } = await supabase.auth.api.listUsers();
    if (error) {
      throw new UnAuthenticatedError("Invalid Credentials");
    }
    res.status(StatusCodes.OK).json({ users });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "only admin users allowed" });
  }
};

const createUser = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { email } = req.body;
      if (email) {
        const { data: createdUser, error: errorCreatedUser } = await supabase.auth.api.createUser({
          email: email,
          email_confirm: true,
          password: "secret123",
        });
        if (errorCreatedUser) return res.status(StatusCodes.NOT_FOUND).json({ error: `createdUser:${errorCreatedUser.message}` });

        const { error: errorLocalUser } = await supabase.from("localusers").insert({ user_id: createdUser.id, isAdmin: false }, { returning: "minimal" });
        if (errorLocalUser) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: `localUser:${errorLocalUser.message}` });
        }
        const { data: localUser, error: errorLocalUserSelect } = await supabase.from("localusers").select("*").eq("user_id", createdUser.id).single();
        if (errorLocalUserSelect) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: `localUser select:${errorLocalUserSelect.message}` });
        }
        return res.status(StatusCodes.OK).json({ user: localUser });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "no email provided for creating the user" });
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "only POST method is accepted" });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "only admin users allowed" });
  }
};

const editUser = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, email, password } = req.body;
      if (email) {
        const { data: editUser, error: errorEditUser } = await supabase.auth.api.updateUserById(id, {
          email: email,
          email_confirm: true,
          password: password,
        });
        if (errorEditUser) return res.status(401).json({ error: `editUser:${errorEditUser.message}` });

        const { data: localUser, error: errorLocalUserSelect } = await supabase.from("localusers").select("*").eq("user_id", editUser.id).single();
        if (errorLocalUserSelect) {
          return res.status(401).json({ error: `localUser select:${errorLocalUserSelect.message}` });
        }
        return res.status(200).json({ user: localUser });
      } else {
        res.status(401).json({ error: "no email provided for editing the user" });
      }
    } else {
      res.status(401).json({ error: "only POST method is accepted" });
    }
  } else {
    res.status(401).json({ error: "only admin users allowed" });
  }
};

const deleteUser = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.body;
      if (id) {
        const { data: client, error: errorClient } = await supabase.from("clients").delete().eq("user_id", id);
        if (errorClient) {
          return res.status(401).json({ error: `client delete:${errorClient.message}` });
        }
        const { data: localUser, error: errorLocalUserDelete } = await supabase.from("localusers").delete().eq("user_id", id);
        if (errorLocalUserDelete) {
          return res.status(401).json({ error: `localUser delete:${errorLocalUserDelete.message}` });
        }

        const { data: deleteUser, error: errorDeleteUser } = await supabase.auth.api.deleteUser(id);
        if (errorDeleteUser) return res.status(401).json({ error: `deleteUser:${errorDeleteUser.message}` });

        return res.status(200).json({ user: deleteUser });
      } else {
        res.status(401).json({ error: "no id provided for deleting the user" });
      }
    } else {
      res.status(401).json({ error: "only POST method is accepted" });
    }
  } else {
    res.status(401).json({ error: "only admin users allowed" });
  }
};

export { getAllUsers, createUser, editUser, deleteUser };
