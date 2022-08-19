import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";
import { decode } from "base64-arraybuffer";

const getOneFile = async (req, res) => {
  const { id } = req.params;
  if (id) {
    const { data: userfile, error } = await supabase.from("files").select("*").eq("id", id).single();
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ userfile, error: { ...error, msg: "getOneFile" } });
    }
    if (userfile) {
      const { data: storageFile, error: errorStorageFile } = await supabase.storage.from(`client${userfile.client_id}`).list("", {
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
        search: userfile.file_name,
      });
      if (errorStorageFile) {
        return res.status(StatusCodes.BAD_REQUEST).json({ userfile, error: { ...errorStorageFile, msg: "getOneFiles, storage.list" }, count });
      }
      const { signedURL, error: errorSignedURL } = await supabase.storage.from(`client${userfile.client_id}`).createSignedUrl(userfile.file_name, 60);
      if (errorSignedURL) {
        return res.status(StatusCodes.BAD_REQUEST).json({ userfile, error: { ...errorSignedURL, msg: "getOneFile,storage.createSignedURL" }, count });
      }
      return {
        ...userfile,
        updated_at: storageFile[0].updated_at,
        created_at: storageFile[0].created_at,
        last_accessed_at: storageFile[0].last_accessed_at,
        size: storageFile[0].metadata.size,
        mimetype: storageFile[0].metadata.mimetype,
        signedURL,
      };
      res.status(StatusCodes.OK).json({ userfile, error });
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ userfile: {}, error: { message: "no file id provided" } });
  }
};

const getAllFiles = async (req, res) => {
  const user = req.user;
  let query = supabase
    .from("files")
    .select("id,client_id,file_name,file_description,user_id,displayed,clients(name)", { count: "exact" })
    .order("client_id", { ascending: true })
    .order("file_name", { ascending: true });
  if (!user.isAdmin) {
    query = query.eq("user_id", user.id);
  }

  const { data: userfiles, error, count } = await query;
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ userfiles, error: { ...error, msg: "getAllFiles" }, count });
  }
  if (count > 0) {
    const detailsUserFiles = userfiles.map(async (file) => {
      const { data: storageFiles, error: errorStorageFiles } = await supabase.storage.from(`client${file.client_id}`).list("", {
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
        search: file.file_name,
      });
      if (errorStorageFiles) {
        return res.status(StatusCodes.BAD_REQUEST).json({ userfiles, error: { ...errorStorageFiles, msg: "getAllFiles, storage.list" }, count });
      }
      return {
        ...file,
        updated_at: storageFiles[0]?.updated_at,
        created_at: storageFiles[0]?.created_at,
        last_accessed_at: storageFiles[0]?.last_accessed_at,
        size: storageFiles[0]?.metadata.size,
        mimetype: storageFiles[0]?.metadata.mimetype,
      };
    });
    Promise.all(detailsUserFiles).then((data) => {
      return res.status(StatusCodes.OK).json({ userfiles: data, error, count });
    });
  } else {
    return res.status(StatusCodes.OK).json({ userfiles, error, count });
  }
};

const createFile = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { client_id, file_name, file_description } = req.body;
      if (client_id && client_id !== "" && file_name && file_name !== "" && file_description && file_description !== "" && req.files && req.files.file) {
        const { data: client, error: errorClient } = await supabase.from("clients").select("user_id").eq("id", client_id).single();
        if (errorClient) {
          return res.status(StatusCodes.BAD_REQUEST).json({ event: [], error: { ...errorClient, msg: "createFile, select client" } });
        }
        const uploadFile = req.files.file;
        const { data: uploadedFile, error: errorUpload } = await supabase.storage.from(`client${client_id}`).upload(uploadFile.name, uploadFile.data, {
          cacheControl: "604800",
          upsert: false,
          contentType: "application/pdf",
        });
        if (errorUpload) {
          // if error on upload, try to remove
          await supabase.storage.from(`client${client_id}`).remove([uploadFile.name]);
          return res.status(StatusCodes.BAD_REQUEST).json({ file: [], error: { ...errorUpload, msg: "createFile,error on upload" } });
        }
        const { data: file, error } = await supabase.from("files").insert({
          client_id,
          file_name: uploadFile.name,
          file_description,
          user_id: client.user_id,
        });
        if (error) {
          // try to delete the file from the bucket
          await supabase.storage.from(`client${client_id}`).remove([uploadFile.name]);
          return res.status(StatusCodes.BAD_REQUEST).json({ file, error: { ...error, msg: "createFile,insert files" } });
        }
        return res.status(StatusCodes.OK).json({ file, error });
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ file: [], error: { message: "no data provided for creating the file" } });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ file: [], error: { message: "only POST method is accepted" } });
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({ file: [], error: { message: "only admin users allowed" } });
  }
};

const editFile = async (req, res) => {
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

const deleteFile = async (req, res) => {
  if (req.method === "DELETE") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      if (id) {
        const { data: event, error } = await supabase.from("files").delete().eq("id", id);
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

export { getAllFiles, getOneFile, createFile, editFile, deleteFile };
