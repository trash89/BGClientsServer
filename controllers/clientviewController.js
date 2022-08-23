import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";
const expiresIn = 60 * 60 * 6; /// 6 hours

const getDetailedFiles = async (userfiles) => {
  const detailsUserFiles = userfiles.map(async (file) => {
    const { data: storageFiles, error: errorStorageFiles } = await supabase.storage.from(`client${file.client_id}`).list("", {
      offset: 0,
      search: file.file_name,
    });
    if (errorStorageFiles) {
      return res.status(StatusCodes.BAD_REQUEST).json({ client, events, userfiles, error: { ...errorStorageFiles, msg: "getClientView, storage.list" } });
    }
    const { publicURL: signedURL, error: errorSignedURL } = await supabase.storage
      .from(`client${file.client_id}`)
      .getPublicUrl(storageFiles[0].name, expiresIn);
    if (errorSignedURL) {
      return res.status(StatusCodes.BAD_REQUEST).json({ client, events, userfiles, error: { ...errorSignedURL, msg: "getClientView, storage.getPublicURL" } });
    }
    return {
      ...file,
      updated_at: storageFiles[0]?.updated_at,
      created_at: storageFiles[0]?.created_at,
      last_accessed_at: storageFiles[0]?.last_accessed_at,
      size: (storageFiles[0]?.metadata.size / 1024 / 1024).toFixed(2),
      mimetype: storageFiles[0]?.metadata.mimetype,
      signedURL,
    };
  });
};

const getClientView = async (req, res) => {
  const { id, email } = req.body;
  if (id) {
    try {
      const { data: client, error: errorClient } = await supabase.from("clients").select("*").eq("user_id", id).single();
      if (errorClient || email != client.email) {
        return res.status(StatusCodes.BAD_REQUEST).json({ client, events: [], userfiles: [], error: { ...errorClient, msg: "getClientView, clients" } });
      }
      try {
        const { data: events, error: errorEvents } = await supabase
          .from("events")
          .select("*")
          .eq("client_id", client.id)
          .eq("displayed", true)
          .order("ev_date", { ascending: false });
        if (errorEvents) {
          return res.status(StatusCodes.BAD_REQUEST).json({ client, events, userfiles: [], error: { ...errorEvents, msg: "getClientView, events" } });
        }
        try {
          const { data: userfiles, error: errorUserfiles } = await supabase
            .from("files")
            .select("*")
            .eq("client_id", client.id)
            .eq("displayed", true)
            .order("id", { ascending: false });
          if (errorUserfiles) {
            return res.status(StatusCodes.BAD_REQUEST).json({ client, events, userfiles, error: { ...errorUserfiles, msg: "getClientView, files" } });
          }
          const iterator = userfiles.values();
          const detailsUserFiles = [];
          for (const key of iterator) {
            try {
              console.log("key=", key);
              const { data: storageFiles, error: errorStorageFiles } = await supabase.storage.from(`client${key.client_id}`).list("", {
                search: key.file_name,
              });
              if (errorStorageFiles) {
                return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ client, events, userfiles, error: { ...errorStorageFiles, msg: "getClientView, storage.list" } });
              }
              console.log("storageFiles=", storageFiles);
              const { publicURL: signedURL, error: errorSignedURL } = supabase.storage.from(`client${key.client_id}`).getPublicUrl(key.file_name, expiresIn);
              if (errorSignedURL) {
                return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ client, events, userfiles, error: { ...errorSignedURL, msg: "getClientView, storage.getPublicURL" } });
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
            }
          }
          return res.status(StatusCodes.OK).json({ client, events, userfiles: detailsUserFiles, error: errorUserfiles });
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ client: {}, events: [], userfiles: [], error: { message: "no id provided" } });
  }
};

export { getClientView };
