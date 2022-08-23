import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const getOneEvent = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (id) {
    try {
      let query = supabase.from("events").select("*").eq("id", id).single();
      if (!user.isAdmin) {
        query = query.eq("user_id", user.id);
      }
      const { data: event, error } = await query;
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "getOneEvent" } });
      }
      res.status(StatusCodes.OK).json({ event, error });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "no event id provided" } });
  }
};

const getAllEvents = async (req, res) => {
  const user = req.user;
  try {
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
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "getAllEvents" } });
    }
    return res.status(StatusCodes.OK).json({ events, error, count });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
};

const createEvent = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { client_id, ev_name, ev_description, ev_date } = req.body;
      if (client_id && client_id !== "" && ev_name && ev_name !== "" && ev_description && ev_description !== "" && ev_date && ev_date !== "") {
        try {
          // selecting user_id from clients
          const { data: client, error: errorClient } = await supabase.from("clients").select("user_id").eq("id", client_id).single();
          if (errorClient) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorClient, msg: "createEvent, select client" } });
          }
          try {
            // insert into events
            const { data: event, error } = await supabase.from("events").insert({
              client_id,
              ev_name,
              ev_description,
              ev_date,
              user_id: client.user_id,
            });
            if (error) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "createEvent,insert events" } });
            }
            return res.status(StatusCodes.OK).json({ event, error });
          } catch (error) {
            console.log(error);
            return res.status(StatusCodes.BAD_REQUEST).json({ error });
          }
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "no data provided for creating the event" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only POST method is accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only admin users allowed" } });
  }
};

const editEvent = async (req, res) => {
  if (req.method === "PATCH") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, client_id, ev_name, ev_description, ev_date, user_id, displayed } = req.body;
      try {
        const { data: event, error } = await supabase.from("events").update({ client_id, ev_name, ev_description, ev_date, user_id, displayed }).eq("id", id);
        if (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "editEvent,update events" } });
        }
        return res.status(StatusCodes.OK).json({ event, error });
      } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({ error });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only PATCH method is accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only admin users allowed" } });
  }
};

const deleteEvent = async (req, res) => {
  if (req.method === "DELETE") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      if (id) {
        try {
          const { data: event, error } = await supabase.from("events").delete().eq("id", id);
          if (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "deleteEvent,delete" } });
          }
          return res.status(StatusCodes.OK).json({ event, error });
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "no event id provided" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "only DELETE method is accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only admin users allowed" } });
  }
};

export { getAllEvents, getOneEvent, createEvent, editEvent, deleteEvent };
