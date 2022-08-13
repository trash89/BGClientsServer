import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const getAllEvents = async (req, res) => {
  const user = req.user;
  let query = supabase
    .from("events")
    .select("id,client_id,ev_name,ev_description,ev_date,user_id,clients(name)", { count: "exact" })
    .order("client_id", { ascending: true })
    .order("ev_date", { ascending: true })
    .order("ev_name", { ascending: true });
  if (!user.isAdmin) {
    query = query.eq("user_id", user.id);
  }
  const { data: events, error, count } = await query;
  if (error) {
    return res.status(StatusCodes.NOT_FOUND).json({ events, error: { ...error, msg: "getAllEvents" }, count });
  }
  res.status(StatusCodes.OK).json({ events, error, count });
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
    const { data: event, error } = await supabase.from("events").select("*").eq("id", id).single();
    if (error) {
      return res.status(StatusCodes.NOT_FOUND).json({ event, error: { ...error, msg: "getOneEvent" } });
    }
    res.status(StatusCodes.OK).json({ event, error });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "no id provided for getting the event" } });
  }
};

const editEvent = async (req, res) => {
  if (req.method === "PATCH") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, client_id, ev_name, ev_description, ev_date, user_id } = req.body;
      const { data: event, error } = await supabase.from("events").update({ client_id, ev_name, ev_description, ev_date, user_id }).eq("id", id);
      if (error) {
        return res.status(StatusCodes.NOT_FOUND).json({ event, error: { ...error, msg: "editEvent,events" } });
      }
      return res.status(StatusCodes.OK).json({ event, error });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "only PATCH method is accepted" } });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "only admin users allowed" } });
  }
};

const deleteEvent = async (req, res) => {
  if (req.method === "DELETE") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      if (id) {
        const { data: event, error: errorEvent } = await supabase.from("events").delete().eq("id", id);
        if (errorEvent) {
          return res.status(StatusCodes.NOT_FOUND).json({ event, error: { ...errorEvent, msg: "deleteEvent,delete" } });
        }
        return res.status(StatusCodes.OK).json({ event, error: errorEvent });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "no id provided for deleting the event" } });
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "only DELETE method is accepted" } });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ event: [], error: { msg: "only admin users allowed" } });
  }
};

export { getAllEvents, getOneEvent, createEvent, editEvent, deleteEvent };
