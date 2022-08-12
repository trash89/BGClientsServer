import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const getAllEvents = async (req, res) => {
  const user = req.user;
  let query = supabase
    .from("events")
    .select("id,client_id,ev_name,ev_description,ev_date,user_id,clients(name)")
    .order("client_id", { ascending: true })
    .order("ev_date", { ascending: true })
    .order("ev_name", { ascending: true });
  if (!user.isAdmin) {
    query = query.eq("user_id", user.id);
  }
  const { data: events, error } = await query;
  console.log(events);
  if (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ events, error: { ...error, msg: "getAllEvents" } });
  }
  res.status(StatusCodes.OK).json({ events, error });
};

const createEvent = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { client_id, ev_name, ev_description, ev_date } = req.body;
      console.log(req.body);
      if (client_id && client_id !== "" && ev_name && ev_name !== "" && ev_description && ev_description !== "" && ev_date && ev_date !== "") {
        const { data: client, error: errorClient } = await supabase.from("clients").select("user_id").eq("id", client_id).single();
        if (errorClient) {
          return res.status(StatusCodes.NOT_FOUND).json({ event: [], error: { ...errorClient, msg: "createEvent,clients" } });
        }
        const { data: event, error: errorEvent } = await supabase.from("events").insert({
          client_id,
          ev_name,
          ev_description,
          ev_date,
          user_id: client.user_id,
        });
        if (errorEvent) {
          return res.status(StatusCodes.NOT_FOUND).json({ event, error: { ...errorEvent, msg: "createEvent,events" } });
        }
        return res.status(StatusCodes.OK).json({ event, error: errorEvent });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "no client_id/name/description/date provided for creating the event" } });
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "only POST method is accepted" } });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "only admin users allowed" } });
  }
};

const getOneEvent = async (req, res) => {
  const { id } = req.params;
  if (id) {
    const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).single();
    if (error) {
      return res.status(StatusCodes.NOT_FOUND).json({ client, error: { ...error, msg: "getOneClient" } });
    }
    res.status(StatusCodes.OK).json({ client, error });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ client: [], error: { msg: "no id provided for getting the user" } });
  }
};

const editEvent = async (req, res) => {
  if (req.method === "PATCH") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, email, name, description, address, user_id, localuser_id } = req.body;
      if (email) {
        const { data: editUser, error: errorEditUser } = await supabase.auth.api.updateUserById(user_id, {
          email,
          email_confirm: true,
        });
        if (errorEditUser) return res.status(StatusCodes.NOT_FOUND).json({ client: [], error: { ...errorEditUser, msg: "editClient,updateUserById" } });
        const { data: client, error } = await supabase.from("clients").update({ email, name, description, address, user_id, localuser_id }).eq("id", id);
        if (error) {
          return res.status(StatusCodes.NOT_FOUND).json({ client, error: { ...error, msg: "editClient,clients" } });
        }
        return res.status(StatusCodes.OK).json({ client, error });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ client: [], error: { msg: "no email provided for editing the user" } });
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ client: [], error: { msg: "only PATCH method is accepted" } });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ client: [], error: { msg: "only admin users allowed" } });
  }
};

const deleteEvent = async (req, res) => {
  if (req.method === "DELETE") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      if (id) {
        const { data: clientSel, error: errorClientSel } = await supabase.from("clients").select("id,localuser_id,user_id").eq("id", id).single();
        if (errorClientSel) {
          return res.status(StatusCodes.NOT_FOUND).json({ client: clientSel, error: { ...errorClientSel, msg: "deleteClient,select" } });
        }
        const { data: client, error: errorClient } = await supabase.from("clients").delete().eq("id", id);
        if (errorClient) {
          return res.status(StatusCodes.NOT_FOUND).json({ client, error: { ...errorClient, msg: "deleteClient,delete" } });
        }
        const { data: localUser, error: errorLocalUserDelete } = await supabase.from("localusers").delete().eq("id", clientSel.localuser_id);
        if (errorLocalUserDelete) {
          return res.status(StatusCodes.NOT_FOUND).json({ client, error: { ...errorLocalUserDelete, msg: "deleteClient,localusers" } });
        }
        const { data: deleteUser, error: errorDeleteUser } = await supabase.auth.api.deleteUser(clientSel.user_id);
        if (errorDeleteUser) return res.status(StatusCodes.NOT_FOUND).json({ client, error: { ...errorDeleteUser, msg: "deleteClient,deleteUser" } });
        return res.status(StatusCodes.OK).json({ client: clientSel, error: errorDeleteUser });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ client: [], error: { msg: "no id provided for deleting the client" } });
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ client: [], error: { msg: "only DELETE method is accepted" } });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ client: [], error: { msg: "only admin users allowed" } });
  }
};

export { getAllEvents, getOneEvent, createEvent, editEvent, deleteEvent };
