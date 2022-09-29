import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const sendResetLink = async (req, res) => {
  if (req.method === "PATCH") {
    const { id } = req.params;
    const { email } = req.body;
    const user = req.user;
    if (user.isAdmin) {
      if (id && email && email !== "") {
        try {
          let query = supabase.from("clients").select("*").eq("id", parseInt(id));
          if (!user.isAdmin) {
            query = query.eq("user_id", user.id);
          }
          query = query.single();
          const { data: client, error } = await query;
          if (error) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "sendResetLink,clients" } });
          }
          if (email === client.email) {
            try {
              const { error } = await supabase.auth.api.resetPasswordForEmail(client.email, {
                redirectTo: process.env.NODE_ENV === "production" ? "https://bgclients.vercel.app/passwordReset" : "http://localhost:3000/passwordReset",
              });
              if (error) {
                return res.status(StatusCodes.NOT_FOUND).json({ error });
              }
              return res.status(StatusCodes.OK).json({ client, error });
            } catch (error) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error });
            }
          } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "sendResetLink,invalid email" } });
          }
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "no data provided" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "only admin users allowed" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not accepted" } });
  }
};

const resetPassword = async (req, res) => {
  if (req.method === "POST") {
    const { id } = req.params;
    const { password } = req.body;
    const user = req.user;
    if (user.isAdmin) {
      if (id && password && password !== "") {
        // reset the password
        try {
          let query = supabase.from("clients").select("*").eq("id", parseInt(id));
          if (!user.isAdmin) {
            query = query.eq("user_id", user.id);
          }
          query = query.single();
          const { data: client, error } = await query;
          if (error) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "changePassword,clients" } });
          }
          try {
            const { data: user, error: errorUser } = await supabase.auth.api.updateUserById(client.user_id, { password });
            if (errorUser) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUser, msg: "changePassword,updateUserById" } });
            }
            return res.status(StatusCodes.OK).json({ client, error });
          } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error });
          }
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "only admin users allowed" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not accepted" } });
  }
};

const changePassword = async (req, res) => {
  if (req.method === "PUT") {
    const { id } = req.params;
    const { email, password1, password2, access_token } = req.body;
    const user = req.user;
    if (id && email && email !== "" && password1 && password1 !== "" && password2 && password2 !== "" && access_token && access_token !== "") {
      try {
        let query = supabase.from("clients").select("*").eq("id", parseInt(id));
        if (!user.isAdmin) {
          query = query.eq("user_id", user.id);
        }
        query = query.single();
        const { data: client, error } = await query;
        if (error) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "resetClient,clients" } });
        }
        try {
          const { user: userHash, error: errorHash } = await supabase.auth.api.getUser(access_token);
          if (errorHash) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorHash, msg: "resetClient,getUser" } });
          }
          if (userHash.id === client.user_id) {
            const { data: user, error: errorUser } = await supabase.auth.api.updateUserById(client.user_id, { password: password1 });
            if (errorUser) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUser, msg: "resetClient,updateUserById" } });
            }
            return res.status(StatusCodes.OK).json({ client, error });
          } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "invalid user id" } });
          }
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "invalid data provided" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not accepted" } });
  }
};

const getOneClient = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (id) {
    try {
      let query = supabase.from("clients").select("*").eq("id", id);
      if (!user.isAdmin) {
        query = query.eq("user_id", user.id);
      }
      query = query.single();
      const { data: client, error: errorClient } = await query;
      if (errorClient) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorClient, msg: "getOneClient" } });
      }
      try {
        let query = supabase
          .from("events")
          .select("*", { count: "exact" })
          .eq("client_id", client.id)
          .order("ev_date", { ascending: true })
          .order("ev_name", { ascending: true });
        if (!user.isAdmin) {
          query = query.eq("user_id", user.id);
        }
        const { data: events, error: errorEvents, count: countEvents } = await query;
        if (errorEvents) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorEvents, msg: "getOneClient, events" } });
        }
        try {
          let query = supabase.from("files").select("*", { count: "exact" }).eq("client_id", client.id).order("file_name", { ascending: true });
          if (!user.isAdmin) {
            query = query.eq("user_id", user.id);
          }
          const { data: userfiles, error: errorUserfiles, count: countUserfiles } = await query;
          if (errorUserfiles) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorUserfiles, msg: "getOneClient, userfiles" } });
          }
          return res
            .status(StatusCodes.OK)
            .json({ client, events: { events, count: countEvents }, userfiles: { userfiles, count: countUserfiles }, error: errorClient });
        } catch (error) {
          return res.status(StatusCodes.NOT_FOUND).json({ error });
        }
      } catch (error) {
        return res.status(StatusCodes.NOT_FOUND).json({ error });
      }
    } catch (error) {
      return res.status(StatusCodes.NOT_FOUND).json({ error });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "no data provided" } });
  }
};

const getAllClients = async (req, res) => {
  const user = req.user;
  //console.log(req);
  try {
    let query = supabase.from("clients").select("*", { count: "exact" }).order("name", { ascending: true });
    if (!user.isAdmin) {
      query = query.eq("user_id", user.id);
    }
    const { data: clients, error, count } = await query;
    if (error) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "getAllClients" } });
    }
    return res.status(StatusCodes.OK).json({ clients, error, count });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
};

const createClient = async (req, res) => {
  if (req.method === "POST") {
    const user = req.user;
    if (user.isAdmin) {
      const { email, password, name, description, address } = req.body;
      if (email && email !== "" && password && password !== "" && name && name !== "" && description && description !== "" && address && address !== "") {
        try {
          // creating the supabase user
          const { data: createdUser, error: errorCreatedUser } = await supabase.auth.api.createUser({
            email,
            email_confirm: true,
            password,
          });
          if (errorCreatedUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorCreatedUser, msg: "createClient,createUser" } });
          }
          try {
            // insert into localusers
            const { data: localUser, error: errorLocalUser } = await supabase.from("localusers").insert({ user_id: createdUser.id, isAdmin: false });
            if (errorLocalUser) {
              // cleanup
              try {
                // delete the supabase user
                await supabase.auth.api.deleteUser(createdUser.id);
              } catch (error) {
                //console.log(error);
              }
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorLocalUser, msg: "createClient,insert localusers" } });
            }
            try {
              //insert into clients
              const { data: client, error: errorClient } = await supabase.from("clients").insert({
                email,
                name,
                description,
                address,
                localuser_id: localUser[0].id,
                user_id: createdUser.id,
              });
              if (errorClient) {
                // cleanup
                try {
                  // delete the localuser
                  await supabase.from("localusers").delete().eq("id", localUser[0].id);
                  // delete the supabase user
                  await supabase.auth.api.deleteUser(createdUser.id);
                } catch (error) {
                  //console.log(error);
                }
                return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorClient, msg: "createClient,insert clients" } });
              }
              try {
                // creating the bucket
                const { error } = await supabase.storage.createBucket(`client${client[0].id}`, { public: true });
                if (error) {
                  // cleanup
                  try {
                    // delete the created client
                    await supabase.from("clients").delete().eq("id", client[0].id);
                    // delete the localuser
                    await supabase.from("localusers").delete().eq("id", localUser[0].id);
                    // delete the supabase user
                    await supabase.auth.api.deleteUser(createdUser.id);
                  } catch (error) {
                    //console.log(error);
                  }
                  return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "createClient,create bucket" } });
                }
                return res.status(StatusCodes.OK).json({ client, error: errorClient });
                // now, the client is created
              } catch (error) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error });
              }
            } catch (error) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error });
            }
          } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error });
          }
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "no data provided" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "only admin users allowed" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { msg: "method not accepted" } });
  }
};

const editClient = async (req, res) => {
  if (req.method === "PATCH") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, email, name, description, address, user_id, localuser_id } = req.body;
      if (id && email && name && description && address && user_id && localuser_id) {
        try {
          //update the client
          const { data: client, error } = await supabase.from("clients").update({ email, name, description, address, user_id, localuser_id }).eq("id", id);
          if (error) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "editClient,update clients" } });
          }
          try {
            //update the user email
            const { data: editUser, error: errorEditUser } = await supabase.auth.api.updateUserById(user_id, {
              email,
              email_confirm: true,
            });
            if (errorEditUser) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorEditUser, msg: "editClient,updateUserById" } });
            }
            return res.status(StatusCodes.OK).json({ client, error });
          } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error });
          }
        } catch (error) {
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

const deleteClient = async (req, res) => {
  if (req.method === "DELETE") {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      if (id) {
        try {
          // select the client
          const { data: clientSel, error: errorClientSel } = await supabase.from("clients").select("id,email,localuser_id,user_id").eq("id", id).single();
          if (errorClientSel) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorClientSel, msg: "deleteClient,select client" } });
          }
          try {
            // delete from events
            const { data: events, error: errorEvents } = await supabase.from("events").delete().eq("client_id", clientSel.id);
            if (errorEvents) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorEvents, msg: "deleteClient,delete events" } });
            }
            try {
              // delete from files
              const { data: files, error: errorFiles } = await supabase.from("files").delete().eq("client_id", clientSel.id);
              if (errorFiles) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorFiles, msg: "deleteClient,delete files" } });
              }
              try {
                // delete from clients
                const { data: client, error: errorClient } = await supabase.from("clients").delete().eq("id", id);
                if (errorClient) {
                  return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorClient, msg: "deleteClient,delete clients" } });
                }
                try {
                  // delete the user
                  const { data: localUser, error: errorLocalUserDelete } = await supabase.from("localusers").delete().eq("id", clientSel.localuser_id);
                  if (errorLocalUserDelete) {
                    return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorLocalUserDelete, msg: "deleteClient,delete localusers" } });
                  }
                  try {
                    // empty the bucket
                    const { data: emptyBucket, error: errorEmptyBucket } = await supabase.storage.emptyBucket(`client${clientSel.id}`);
                    if (errorEmptyBucket) {
                      return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorEmptyBucket, msg: "deleteClient,empty bucket" } });
                    }
                    try {
                      // delete the bucket
                      const { error } = await supabase.storage.deleteBucket(`client${clientSel.id}`);
                      if (error) {
                        return res.status(StatusCodes.NOT_FOUND).json({ error: { ...error, msg: "deleteClient,delete bucket" } });
                      }
                      try {
                        // delete the user
                        const { error: errorDeleteUser } = await supabase.auth.api.deleteUser(clientSel.user_id);
                        if (errorDeleteUser) {
                          return res.status(StatusCodes.NOT_FOUND).json({ error: { ...errorDeleteUser, msg: "deleteClient,deleteUser" } });
                        }
                        // OK, return the deleted client
                        return res.status(StatusCodes.OK).json({ client: clientSel, error: errorDeleteUser });
                      } catch (error) {
                        return res.status(StatusCodes.BAD_REQUEST).json({ error });
                      }
                    } catch (error) {
                      return res.status(StatusCodes.BAD_REQUEST).json({ error });
                    }
                  } catch (error) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ error });
                  }
                } catch (error) {
                  return res.status(StatusCodes.BAD_REQUEST).json({ error });
                }
              } catch (error) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error });
              }
            } catch (error) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error });
            }
          } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error });
          }
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ client: [], error: { msg: "no data provided" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ client: [], error: { msg: "method not accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ client: [], error: { msg: "only admin users allowed" } });
  }
};

export { getAllClients, getOneClient, createClient, editClient, deleteClient, resetPassword, changePassword, sendResetLink };
