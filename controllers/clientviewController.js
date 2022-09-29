import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";
const expiresIn = 60 * 60 * 6; /// 6 hours

const getClientView = async (req, res) => {
  if (req.method === "POST") {
    const { id, email } = req.body;
    const user = req.user;
    if (id && email) {
      try {
        let query = supabase.from("clients").select("*").eq("user_id", id);
        if (!user.isAdmin) {
          query = query.eq("user_id", user.id);
        }
        query = query.single();
        const { data: client, error: errorClient } = await query;
        if (errorClient || email != client.email) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorClient, msg: "getClientView, clients" } });
        }
        try {
          let query = supabase.from("events").select("*").eq("client_id", client.id).eq("displayed", true).order("ev_date", { ascending: false });
          if (!user.isAdmin) {
            query = query.eq("user_id", user.id);
          }
          const { data: events, error: errorEvents } = await query;
          if (errorEvents) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorEvents, msg: "getClientView, events" } });
          }
          try {
            let query = supabase.from("files").select("*").eq("client_id", client.id).eq("displayed", true).order("id", { ascending: false });
            if (!user.isAdmin) {
              query = query.eq("user_id", user.id);
            }

            const { data: userfiles, error: errorUserfiles } = await query;
            if (errorUserfiles) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUserfiles, msg: "getClientView, files" } });
            }
            const iterator = userfiles.values();
            const detailsUserFiles = [];
            for (const key of iterator) {
              try {
                const { data: storageFiles, error: errorStorageFiles } = await supabase.storage.from(`client${key.client_id}`).list("", {
                  search: key.file_name,
                });
                if (errorStorageFiles) {
                  return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorStorageFiles, msg: "getClientView, storage.list" } });
                }
                const { publicURL: signedURL, error: errorSignedURL } = supabase.storage.from(`client${key.client_id}`).getPublicUrl(key.file_name, expiresIn);
                if (errorSignedURL) {
                  return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorSignedURL, msg: "getClientView, storage.getPublicURL" } });
                }
                const obj = {
                  ...key,
                  updated_at: storageFiles[0]?.updated_at,
                  created_at: storageFiles[0]?.created_at,
                  last_accessed_at: storageFiles[0]?.last_accessed_at,
                  size: (storageFiles[0]?.metadata.size / 1024 / 1024).toFixed(2),
                  mimetype: storageFiles[0]?.metadata.mimetype,
                  signedURL,
                };
                detailsUserFiles.push(obj);
              } catch (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).json({ error });
              }
            }
            return res.status(StatusCodes.OK).json({ client, events, userfiles: detailsUserFiles, error: errorUserfiles });
          } catch (error) {
            console.log(error);
            return res.status(StatusCodes.BAD_REQUEST).json({ error });
          }
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({ error });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "no data provided" } });
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not allowed" } });
  }
};

export { getClientView };
