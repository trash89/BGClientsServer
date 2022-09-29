import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";
const expiresIn = 60 * 60 * 6; /// 6 hours

const getOneFile = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (id) {
    try {
      let query = supabase.from("files").select("*").eq("id", parseInt(id));
      if (!user.isAdmin) {
        query = query.eq("user_id", user.id);
      }
      query = query.single();
      const { data: userfile, error } = await query;
      if (error) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "getOneFile" } });
      }
      if (userfile) {
        try {
          const { data: storageFile, error: errorStorageFile } = await supabase.storage.from(`client${userfile.client_id}`).list("", {
            search: userfile.file_name,
          });
          if (errorStorageFile) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorStorageFile, msg: "getOneFiles, storage.list" } });
          }

          // const { signedURL, error: errorSignedURL } = await supabase.storage.from(`client${userfile.client_id}`).createSignedUrl(userfile.file_name, expiresIn);
          // if (errorSignedURL) {
          //   return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorSignedURL, msg: "getOneFile,storage.createSignedURL" } });
          // }
          const { publicURL: signedURL, error: errorPublicURL } = supabase.storage
            .from(`client${userfile.client_id}`)
            .getPublicUrl(userfile.file_name, expiresIn);
          if (errorPublicURL) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorPublicURL, msg: "getOneFile,storage.getPublicURL" } });
          }
          const obj = {
            ...userfile,
            updated_at: storageFile[0]?.updated_at,
            created_at: storageFile[0]?.created_at,
            last_accessed_at: storageFile[0]?.last_accessed_at,
            size: (storageFile[0]?.metadata?.size / 1024 / 1024).toFixed(2),
            mimetype: storageFile[0]?.metadata?.mimetype,
            signedURL,
          };
          return res.status(StatusCodes.OK).json({ userfile: obj, error });
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "no data provided" } });
  }
};

const getAllFiles = async (req, res) => {
  const user = req.user;
  try {
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
      return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "getAllFiles" } });
    }
    // const detailsUserFiles = [];
    // const iterator = userfiles.values();
    // for (const key of iterator) {
    //   try {
    //     const { data: storageFiles, error: errorStorageFiles } = await supabase.storage.from(`client${key.client_id}`).list("", {
    //       search: key.file_name,
    //     });
    //     if (errorStorageFiles) {
    //       return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorStorageFiles, msg: "getAllFiles, storage.list" } });
    //     }
    //     const obj = {
    //       ...key,
    //       updated_at: storageFiles[0]?.updated_at,
    //       created_at: storageFiles[0]?.created_at,
    //       last_accessed_at: storageFiles[0]?.last_accessed_at,
    //       size: (storageFiles[0]?.metadata.size / 1024 / 1024).toFixed(2),
    //       mimetype: storageFiles[0]?.metadata.mimetype,
    //     };
    //     detailsUserFiles.push(obj);
    //   } catch (error) {
    //     console.log(error);
    //     return res.status(StatusCodes.BAD_REQUEST).json({ error });
    //   }
    // }
    // return res.status(StatusCodes.OK).json({ userfiles: detailsUserFiles, error, count });
    return res.status(StatusCodes.OK).json({ userfiles, error, count });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
};

const createFile = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    //console.log("req.body=", req.body);
    //console.log("req.files=", req.files);
    if (user.isAdmin) {
      const { client_id, file_description } = req.body;
      const uploadFile = req.files?.file;
      if (client_id && client_id !== "" && file_description && file_description !== "" && req.files && req.files?.file) {
        try {
          const { data: client, error: errorClient } = await supabase.from("clients").select("user_id").eq("id", client_id).single();
          if (errorClient) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorClient, msg: "createFile, select client" } });
          }
          try {
            const { data: uploadedFile, error: errorUpload } = await supabase.storage.from(`client${client_id}`).upload(uploadFile.name, uploadFile.data, {
              cacheControl: "604800",
              upsert: false,
              contentType: "application/pdf",
            });
            if (errorUpload) {
              try {
                // if error on upload, try to remove
                await supabase.storage.from(`client${client_id}`).remove([uploadFile.name]);
              } catch (error) {
                console.log(error);
              }
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUpload, msg: "createFile,error on upload" } });
            }
            try {
              const { data: file, error } = await supabase.from("files").insert({
                client_id,
                file_name: uploadFile.name,
                file_description,
                user_id: client.user_id,
              });
              if (error) {
                try {
                  // try to delete the file from the bucket
                  await supabase.storage.from(`client${client_id}`).remove([uploadFile.name]);
                } catch (error) {
                  console.log(error);
                  return res.status(StatusCodes.NOT_FOUND).json({ error });
                }
                return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "createFile,insert files" } });
              }
              return res.status(StatusCodes.OK).json({ file, error });
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
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "only admin users allowed" } });
  }
};

const editFile = async (req, res) => {
  if (req.method === "PATCH") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, client_id, file_description, displayed } = req.body;
      console.log(req.body);
      let uploadNewFile = null;
      if (req.files) {
        uploadNewFile = req.files.file;
      }
      //console.log("req.body=", req.body);
      //console.log("uploadNewFile=", uploadNewFile);
      if (id && id !== "" && client_id && client_id !== "" && file_description && file_description !== "") {
        try {
          //select the old file
          const { data: userfile, error: errorUserfile } = await supabase.from("files").select("*").eq("id", parseInt(id)).single();
          if (errorUserfile) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUserfile, msg: "editFile, select files" } });
          }
          if (parseInt(client_id) !== userfile.client_id) {
            // client_id changed, so change the bucket
            if (uploadNewFile) {
              try {
                // uploaded a new file to a new client bucket and delete the old file from the old client bucket
                // move it to a new client bucket
                const { data: fileInNewBucket, error: errorFileInNewBucket } = await supabase.storage
                  .from(`client${client_id}`)
                  .upload(uploadNewFile.name, uploadNewFile.data, {
                    cacheControl: "604800",
                    upsert: false,
                    contentType: "application/pdf",
                  });
                if (errorFileInNewBucket) {
                  return res
                    .status(StatusCodes.NOT_FOUND)
                    .json({ error: { ...errorFileInNewBucket, msg: "editFile,error on writing a new file to the new client bucket" } });
                }
                try {
                  // delete the old file in the old client bucket
                  const { data: oldFileInBucket, error: errorOldFileInBucket } = await supabase.storage
                    .from(`client${userfile.client_id}`)
                    .remove([userfile.file_name]);
                  if (errorOldFileInBucket) {
                    return res
                      .status(StatusCodes.NOT_FOUND)
                      .json({ error: { ...errorOldFileInBucket, msg: "editFile,error on deleting old file in old bucket" } });
                  }
                  try {
                    // update files table
                    const { data: file, error } = await supabase
                      .from("files")
                      .update({
                        client_id,
                        file_name: uploadNewFile.name,
                        file_description,
                        displayed,
                      })
                      .eq("id", parseInt(id));
                    if (error) {
                      return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "editFile,update files table on new client" } });
                    }
                    return res.status(StatusCodes.OK).json({ file, error });
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
              try {
                // just move the exising file to the new client bucket
                // read the existing file
                const { data: oldFileInBucket, error: errorOldFileInBucket } = await supabase.storage
                  .from(`client${userfile.client_id}`)
                  .download(userfile.file_name);
                if (errorOldFileInBucket) {
                  return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorOldFileInBucket, msg: "editFile,error on reading file in old bucket" } });
                }
                try {
                  // move it to a new client bucket
                  const { data: fileInNewBucket, error: errorFileInNewBucket } = await supabase.storage
                    .from(`client${client_id}`)
                    .upload(userfile.file_name, oldFileInBucket, {
                      cacheControl: "604800",
                      upsert: false,
                      contentType: "application/pdf",
                    });
                  if (errorFileInNewBucket) {
                    return res
                      .status(StatusCodes.NOT_FOUND)
                      .json({ error: { ...errorFileInNewBucket, msg: "editFile,error on writing file to the new client bucket" } });
                  }
                  try {
                    // update files table
                    const { data: file, error } = await supabase
                      .from("files")
                      .update({
                        client_id,
                        file_description,
                        displayed,
                      })
                      .eq("id", parseInt(id));
                    if (error) {
                      return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "editFile,update files table" } });
                    }
                    return res.status(StatusCodes.OK).json({ file, error });
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
            }
          } else {
            /// same client
            if (uploadNewFile) {
              try {
                // uploaded a new file
                const { data: uploadedNewFile, error: errorUploadedNewFile } = await supabase.storage
                  .from(`client${userfile.client_id}`)
                  .upload(uploadNewFile.name, uploadNewFile.data, {
                    cacheControl: "604800",
                    upsert: false,
                    contentType: "application/pdf",
                  });
                if (errorUploadedNewFile) {
                  try {
                    // if error on upload, try to remove
                    await supabase.storage.from(`client${userfile.client_id}`).remove([uploadNewFile.name]);
                  } catch (error) {
                    console.log(error);
                  }
                  return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUploadedNewFile, msg: "editFile,error on upload new file" } });
                }
                try {
                  const { data: file, error } = await supabase
                    .from("files")
                    .update({
                      file_name: uploadNewFile.name,
                      file_description,
                      displayed,
                    })
                    .eq("id", parseInt(id));
                  if (error) {
                    try {
                      // try to delete the file from the bucket
                      await supabase.storage.from(`client${userfile.client_id}`).remove([uploadNewFile.name]);
                    } catch (error) {
                      console.log(error);
                    }
                    return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "editFile,update files" } });
                  }
                  try {
                    // delete the old file
                    const { error: errorOldFile } = await supabase.storage.from(`client${userfile.client_id}`).remove([userfile.file_name]);
                    if (errorOldFile) {
                      return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorOldFile, msg: "editFile,delete the old file" } });
                    }
                    return res.status(StatusCodes.OK).json({ file, error });
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
              // no new file uploaded, only file_description and displayed to update
              const { data: userfileToUpdate, error: errorUserfileToUpdate } = await supabase
                .from("files")
                .update({ file_description, displayed })
                .eq("id", parseInt(id));
              if (errorUserfileToUpdate) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUserfileToUpdate, msg: "editFile,update files" } });
              }
              return res.status(StatusCodes.OK).json({ file: userfileToUpdate, error: errorUserfileToUpdate });
            }
          }
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.NOT_FOUND).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "no data provided" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "only admin users allowed" } });
  }
};

const deleteFile = async (req, res) => {
  if (req.method === "DELETE") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      if (id) {
        try {
          // select the row in files
          const { data: userfile, error: errorUserfile } = await supabase.from("files").select("*").eq("id", parseInt(id)).single();
          if (errorUserfile) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUserfile, msg: "deleteFile, select files" } });
          }
          try {
            // remove the file on storage
            const { error: errorDeleteFile } = await supabase.storage.from(`client${userfile.client_id}`).remove([userfile.file_name]);
            if (errorDeleteFile) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorDeleteFile, msg: "deleteFile, delete file" } });
            }
            try {
              // delete the row in files table
              const { data: deletedFile, error: errorDeletedFile } = await supabase.from("files").delete().eq("id", parseInt(id));
              if (errorDeletedFile) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorDeletedFile, msg: "deleteFile,delete files" } });
              }
              return res.status(StatusCodes.OK).json({ file: deletedFile, error: errorDeletedFile });
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
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "no data provided" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "only admin users allowed" } });
  }
};

export { getAllFiles, getOneFile, createFile, editFile, deleteFile };
