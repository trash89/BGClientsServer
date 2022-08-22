import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";
const expiresIn = 60 * 60 * 6; /// 6 hours

const getClientView = async (req, res) => {
  const { id, email } = req.body;
  if (id) {
    const { data: client, error: errorClient } = await supabase.from("clients").select("*").eq("user_id", id).single();
    if (errorClient || email != client.email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ client, events: [], userfiles: [], error: { ...errorClient, msg: "getClientView, clients" } });
    } else {
      const { data: events, error: errorEvents } = await supabase
        .from("events")
        .select("*")
        .eq("client_id", client.id)
        .eq("displayed", true)
        .order("ev_date", { ascending: false });
      if (errorEvents) {
        return res.status(StatusCodes.BAD_REQUEST).json({ client, events, userfiles: [], error: { ...errorEvents, msg: "getClientView, events" } });
      } else {
        const { data: userfiles, error: errorUserfiles } = await supabase
          .from("files")
          .select("*")
          .eq("client_id", client.id)
          .eq("displayed", true)
          .order("id", { ascending: false });
        if (errorUserfiles) {
          return res.status(StatusCodes.BAD_REQUEST).json({ client, events, userfiles, error: { ...errorUserfiles, msg: "getClientView, files" } });
        } else {
          if (userfiles && userfiles.length > 0) {
            const detailsUserFiles = userfiles.map(async (file) => {
              const { data: storageFiles, error: errorStorageFiles } = await supabase.storage.from(`client${file.client_id}`).list("", {
                offset: 0,
                search: file.file_name,
              });
              if (errorStorageFiles) {
                return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ client, events, userfiles, error: { ...errorStorageFiles, msg: "getClientView, storage.list" }, count });
              } else {
                const { signedURL, error: errorSignedURL } = await supabase.storage.from(`client${file.client_id}`).createSignedUrl(file.file_name, expiresIn);
                if (errorSignedURL) {
                  return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ client, events, userfiles, error: { ...errorSignedURL, msg: "getClientView, storage.createSignedURL" } });
                } else {
                  return {
                    ...file,
                    updated_at: storageFiles[0]?.updated_at,
                    created_at: storageFiles[0]?.created_at,
                    last_accessed_at: storageFiles[0]?.last_accessed_at,
                    size: (storageFiles[0]?.metadata.size / 1024 / 1024).toFixed(2),
                    mimetype: storageFiles[0]?.metadata.mimetype,
                    signedURL,
                  };
                }
              }
            });
            Promise.all(detailsUserFiles)
              .then((data) => {
                return res.status(StatusCodes.OK).json({ client, events, userfiles: data, error: errorUserfiles });
              })
              .catch((err) => {
                return res.status(StatusCodes.BAD_REQUEST).json({ client, events, userfiles, error: { ...err, msg: "getClientView, resolve promises" } });
              });
          } else {
            res.status(StatusCodes.OK).json({ client, events, userfiles, error: errorUserfiles });
          }
        }
      }
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ client: {}, events: [], userfiles: [], error: { message: "no id provided" } });
  }
};

export { getClientView };
