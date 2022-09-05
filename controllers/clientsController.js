import { supabase } from "../supabase/supabaseServer.js";
import { StatusCodes } from "http-status-codes";

const resetClient = async (req, res) => {
  if (req.method === "PUT") {
    const { id } = req.params;
    const { password, email } = req.body;
    const user = req.user;
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
          return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "resetClient,clients" } });
        }
        try {
          const { data: user, error: errorUser } = await supabase.auth.api.updateUserById(client.user_id, { password });
          if (errorUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorUser, msg: "resetClient,updateUserById" } });
          }
          return res.status(StatusCodes.OK).json({ client, error });
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({ error });
      }
    } else {
      // send reset link to user
      if (id && email && email !== "") {
        try {
          let query = supabase.from("clients").select("*").eq("id", parseInt(id));
          if (!user.isAdmin) {
            query = query.eq("user_id", user.id);
          }
          query = query.single();
          const { data: client, error } = await query;
          if (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "resetClient,clients" } });
          }
          if (email === client.email) {
            try {
              const { error } = await supabase.auth.api.resetPasswordForEmail(client.email, {
                redirectTo: "http://localhost:3000/password-reset",
              });
              if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).json({ error });
              }
              return res.status(StatusCodes.OK).json({ client, error });
            } catch (error) {
              console.log(error);
              return res.status(StatusCodes.BAD_REQUEST).json({ error });
            }
          } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "resetClient,invalid email" } });
          }
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "no data provided" } });
      }
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only PUT method is accepted" } });
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
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorClient, msg: "getOneClient" } });
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
          return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorEvents, msg: "getOneClient, events" } });
        }
        try {
          let query = supabase.from("files").select("*", { count: "exact" }).eq("client_id", client.id).order("file_name", { ascending: true });
          if (!user.isAdmin) {
            query = query.eq("user_id", user.id);
          }
          const { data: userfiles, error: errorUserfiles, count: countUserfiles } = await query;
          if (errorUserfiles) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorUserfiles, msg: "getOneClient, userfiles" } });
          }
          return res
            .status(StatusCodes.OK)
            .json({ client, events: { events, count: countEvents }, userfiles: { userfiles, count: countUserfiles }, errorClient });
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
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "no id provided for getting the user" } });
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
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "getAllClients" } });
    }
    return res.status(StatusCodes.OK).json({ clients, error, count });
  } catch (error) {
    console.log(error);
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
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorCreatedUser, msg: "createClient,createUser" } });
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
                console.log(error);
              }
              return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorLocalUser, msg: "createClient,insert localusers" } });
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
                  console.log(error);
                }
                return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorClient, msg: "createClient,insert clients" } });
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
                    console.log(error);
                  }
                  return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "createClient,create bucket" } });
                }
                return res.status(StatusCodes.OK).json({ client, error: errorClient });
                // now, the client is created
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
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "no data provided for creating the user" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only POST method is accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only admin users allowed" } });
  }
};

const editClient = async (req, res) => {
  if (req.method === "PATCH") {
    const user = req.user;
    if (user.isAdmin) {
      const { id, email, name, description, address, user_id, localuser_id } = req.body;
      if (id && email && name && description && address && user_id && localuser_id) {
        try {
          //update the user email
          const { data: editUser, error: errorEditUser } = await supabase.auth.api.updateUserById(user_id, {
            email,
            email_confirm: true,
          });
          if (errorEditUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorEditUser, msg: "editClient,updateUserById" } });
          }
          try {
            //update the client
            const { data: client, error } = await supabase.from("clients").update({ email, name, description, address, user_id, localuser_id }).eq("id", id);
            if (error) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "editClient,update clients" } });
            }
            return res.status(StatusCodes.OK).json({ client, error });
          } catch (error) {
            console.log(error);
            return res.status(StatusCodes.BAD_REQUEST).json({ error });
          }
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "no complete data provided for editing the client" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only PATCH method is accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: { message: "only admin users allowed" } });
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
            return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorClientSel, msg: "deleteClient,select client" } });
          }
          try {
            // delete from events
            const { data: events, error: errorEvents } = await supabase.from("events").delete().eq("client_id", clientSel.id);
            if (errorEvents) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorEvents, msg: "deleteClient,delete events" } });
            }
            try {
              // delete from files
              const { data: files, error: errorFiles } = await supabase.from("files").delete().eq("client_id", clientSel.id);
              if (errorFiles) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorFiles, msg: "deleteClient,delete files" } });
              }
              try {
                // delete from clients
                const { data: client, error: errorClient } = await supabase.from("clients").delete().eq("id", id);
                if (errorClient) {
                  return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorClient, msg: "deleteClient,delete clients" } });
                }
                try {
                  // delete the user
                  const { data: localUser, error: errorLocalUserDelete } = await supabase.from("localusers").delete().eq("id", clientSel.localuser_id);
                  if (errorLocalUserDelete) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorLocalUserDelete, msg: "deleteClient,delete localusers" } });
                  }
                  try {
                    // empty the bucket
                    const { data: emptyBucket, error: errorEmptyBucket } = await supabase.storage.emptyBucket(`client${clientSel.id}`);
                    if (errorEmptyBucket) {
                      return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorEmptyBucket, msg: "deleteClient,empty bucket" } });
                    }
                  } catch (error) {
                    console.log(error);
                    return res.status(StatusCodes.BAD_REQUEST).json({ error });
                  }
                  try {
                    // delete the bucket
                    const { error } = await supabase.storage.deleteBucket(`client${clientSel.id}`);
                    if (error) {
                      return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...error, msg: "deleteClient,delete bucket" } });
                    }
                    try {
                      // delete the user
                      const { error: errorDeleteUser } = await supabase.auth.api.deleteUser(clientSel.user_id);
                      if (errorDeleteUser) {
                        return res.status(StatusCodes.BAD_REQUEST).json({ error: { ...errorDeleteUser, msg: "deleteClient,deleteUser" } });
                      }
                      // OK, return the deleted client
                      return res.status(StatusCodes.OK).json({ client: clientSel, error: errorDeleteUser });
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
        } catch (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).json({ error });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ client: [], error: { message: "no id provided for deleting the client" } });
      }
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ client: [], error: { message: "only DELETE method is accepted" } });
    }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ client: [], error: { message: "only admin users allowed" } });
  }
};

export { getAllClients, getOneClient, createClient, editClient, deleteClient, resetClient };
