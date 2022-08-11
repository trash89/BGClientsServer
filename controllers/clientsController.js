import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnAuthenticatedError } from "../errors/index.js";

import { supabase, getUserOnServer } from "../supabase/supabaseServer.js";

const getAllClients = async (req, res) => {
  const user = req.user;
  let query = supabase.from("clients").select("*");
  if (!user.isAdmin) {
    query = query.eq("user_id", user.id);
  }
  const { data: clients, error } = await query;
  if (error) {
    throw new NotFoundError(error.message);
  }
  res.status(StatusCodes.OK).json({ clients, error });
};

const createClient = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { email, password, name, description, address } = req.body;
      if (email && email !== "" && password && password !== "" && name && name !== "" && description && description !== "" && address && address !== "") {
        const { data: createdUser, error: errorCreatedUser } = await supabase.auth.api.createUser({
          email,
          email_confirm: true,
          password,
        });
        if (errorCreatedUser) return res.status(StatusCodes.NOT_FOUND).json({ error: `createdUser:${errorCreatedUser.message}` });

        const { data: localUser, error: errorLocalUser } = await supabase.from("localusers").insert({ user_id: createdUser.id, isAdmin: false });
        if (errorLocalUser) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: `localUser:${errorLocalUser.message}` });
        }
        const { data: client, error: errorClient } = await supabase.from("clients").insert({
          email,
          name,
          description,
          address,
          localuser_id: localUser[0].id,
          user_id: createdUser.id,
        });
        if (errorClient) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: `createClient:${errorClient.message}` });
        }
        return res.status(StatusCodes.OK).json({ client });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "no email/password/name/description/address provided for creating the user" });
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "only POST method is accepted" });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "only admin users allowed" });
  }
};

const getOneClient = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  if (id) {
    const { data: client, error } = await supabase.from("clients").select("*").eq("id", id);
    if (error) {
      throw new NotFoundError(error.message);
    }
    res.status(StatusCodes.OK).json({ client, error });
  } else {
    res.status(StatusCodes.NOT_FOUND).json({ error: "no id provided for getting the user" });
  }
};

const editClient = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, email, password, name, description, address, user_id, localuser_id } = req.body;
      if (email) {
        const { data: editUser, error: errorEditUser } = await supabase.auth.api.updateUserById(user_id, {
          email,
          email_confirm: true,
          password,
        });
        if (errorEditUser) return res.status(401).json({ error: `editUser:${errorEditUser.message}` });
        const { data: client, error } = await supabase.from("clients").update({ email, name, description, address, user_id, localuser_id }).eq("id", id);

        if (error) {
          return res.status(401).json({ error: `editClient:${error.message}` });
        }
        return res.status(200).json({ client, error });
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

const deleteClient = async (req, res) => {
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

export { getAllClients, getOneClient, createClient, editClient, deleteClient };
