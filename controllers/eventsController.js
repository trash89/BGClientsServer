import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const getOneEvent = async (req, res) => {
  const { id } = req.params;
  if (id) {
    const { data: event, error } = await supabase.from("events").select("*").eq("id", id).single();
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ event, error: { ...error, msg: "getOneEvent" } });
    }
    res.status(StatusCodes.OK).json({ event, error });
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ event: {}, error: { message: "no event id provided" } });
  }
};

const getAllEvents = async (req, res) => {
  const user = req.user;
  let query = supabase
    .from("events")
    .select("id,client_id,ev_name,ev_description,ev_date,user_id,displayed,clients(name)", { count: "exact" })
    .order("client_id", { ascending: true })
    .order("ev_date", { ascending: true })
    .order("ev_name", { ascending: true });
  if (!user.isAdmin) {
    query = query.eq("user_id", user.id);
  }
  const { data: events, error, count } = await query;
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ events, error: { ...error, msg: "getAllEvents" }, count });
  }
  res.status(StatusCodes.OK).json({ events, error, count });
};

const createEvent = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { client_id, ev_name, ev_description, ev_date } = req.body;
      if (client_id && client_id !== "" && ev_name && ev_name !== "" && ev_description && ev_description !== "" && ev_date && ev_date !== "") {
        const { data: client, error: errorClient } = await supabase.from("clients").select("user_id").eq("id", client_id).single();
        if (errorClient) {
          return res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { ...errorClient, msg: "createEvent, select client" } });
        }
        const { data: event, error } = await supabase.from("events").insert({
          client_id,
          ev_name,
          ev_description,
          ev_date,
          user_id: client.user_id,
        });
        if (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ event, error: { ...error, msg: "createEvent,insert events" } });
        }
        return res.status(StatusCodes.OK).json({ event, error });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { message: "no data provided for creating the event" } });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { message: "only POST method is accepted" } });
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { message: "only admin users allowed" } });
  }
};

const editEvent = async (req, res) => {
  if (req.method === "PATCH") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, client_id, ev_name, ev_description, ev_date, user_id, displayed } = req.body;
      const { data: event, error } = await supabase.from("events").update({ client_id, ev_name, ev_description, ev_date, user_id, displayed }).eq("id", id);
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ event, error: { ...error, msg: "editEvent,update events" } });
      }
      return res.status(StatusCodes.OK).json({ event, error });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { message: "only PATCH method is accepted" } });
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { message: "only admin users allowed" } });
  }
};

const deleteEvent = async (req, res) => {
  if (req.method === "DELETE") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      if (id) {
        const { data: event, error } = await supabase.from("events").delete().eq("id", id);
        if (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ event, error: { ...error, msg: "deleteEvent,delete" } });
        }
        return res.status(StatusCodes.OK).json({ event, error });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { message: "no event id provided" } });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { msg: "only DELETE method is accepted" } });
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { message: "only admin users allowed" } });
  }
};

export { getAllEvents, getOneEvent, createEvent, editEvent, deleteEvent };
