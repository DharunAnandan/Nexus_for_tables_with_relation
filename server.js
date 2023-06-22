const { PrismaClient } = require('@prisma/client');
const { queryType, mutationType, stringArg, makeSchema, objectType, nonNull, arg } = require('@nexus/schema');
const { ApolloServer } = require('apollo-server');
const DataLoader = require('dataloader');
const { setArrayFields, setFields } = require('./dataloader');

const prisma = new PrismaClient();



const clientLoader = new DataLoader(async (ids) => {
    const clients = await prisma.client.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return setFields(clients,ids)
  },{cache:true});
  
  const profileLoader = new DataLoader(async (ids) => {
    const profiles = await prisma.profile.findMany({
      where: {
        client_id: {
          in: ids,
        },
      },
    });
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    return ids.map((id) => profiles_by_id.get(id));
  });


const profileListOfClientLoader =new DataLoader(async (ids) => {
    const profiles = await prisma.profile.findMany({
      where: {
        client_id: {
          in: ids,
        },
      },
    });
    return setArrayFields(profiles,ids,"client_id");
  });

  const client = objectType({
    name: 'client',
    definition(t) {
      t.string('id');
      t.string('name');
      t.string('email');
      t.list.field('profiles', {
        type: 'profile',
        resolve: (parent, _args, { loaders }) => {
          return profileListOfClientLoader.load(parent.id);
        

        },
      });
    },
  });
  

  const profile = objectType({
    name: 'profile',
    definition(t) {
      t.string('id');
      t.string('bio');
      t.boolean('is_deleted');
      t.field('client', {
        type: 'client',
        resolve: (parent, _args, { loaders }) => {
          return clientLoader.load(parent.client_id);
        },
      });
    },
  });

const Query = queryType({
    definition(t) {
        t.field('singleClient', {
            type: 'client',
            args: {
                id: nonNull(stringArg()),
            },
            resolve: (_, args) => {
                return prisma.client.findUnique({
                    where: {
                        id: args.id,
                    }
                });
            },
        });

        t.list.field('manyClients', {
            type: 'client',
            resolve: () => {
                return prisma.client.findMany();
            },
        });

        t.field('singleProfile', {
            type: 'profile',
            args: {
                id: nonNull(stringArg()),
            },
            resolve: (_, args) => {
                return prisma.profile.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            },
        });

        t.list.field('manyProfiles', {
            type: 'profile',
            resolve: () => {
                return prisma.profile.findMany();
            },
        });
    },
});

const Mutation = mutationType({
    definition(t){
        t.field('createClient', {
            type: 'client',
            args: {
                name: nonNull(stringArg()),
                email: nonNull(stringArg())
            },
            resolve: async (_parent, args) => {
                return prisma.client.create({
                    data: {
                        name: args.name,
                        email: args.email,
                    },
                });
            },
        });

        t.field('createProfile', {
            type: 'profile',
            args: {
                bio:nonNull(stringArg()),
                client_id: nonNull(stringArg()),
            },
            resolve: (_parent, args) => {
                return prisma.profile.create({
                    data: {
                        bio: args.bio,
                        client: {
                            connect: {
                                id: args.client_id,
                            }
                        },
                    },
                });
            },
        });

        t.field('deleteClient', {
            type: 'client',
            args: {
                id: nonNull(stringArg()),
            },
            resolve:async (_, args) => {
            //    await prisma.profile.deleteMany({
            //         where: {
            //             client_id: args.id,
            //         }
            //     });
               return await prisma.client.delete({
                    where: {
                        id: args.id,
                    },
                });  
            }
        });

        t.field('deleteProfile', {
            type: 'profile',
            args: {
                id: nonNull(stringArg()),
            },
            resolve:async (_, args) => {
               
               return await prisma.profile.delete({
                where: {
                    id: args.id,
                },
                   
                });  
            }
        });

        t.field('softDeleteProfile', {
            type: 'profile',
            args: {
                id: nonNull(stringArg()),
            },
            resolve:async (_, args) => {
               
               return await prisma.profile.update({
                where: {
                    id: args.id,
                },
                data: {
                    is_deleted: true,
                },
                   
                });  
            }
        });

        t.field('updateClient', {
            type: 'client',
            args: {
                id: nonNull(stringArg()),
                data: nonNull(stringArg()),
            },
            resolve: (_, args) => {
                clientLoader.clear(args.id);
                return prisma.client.update({
                    where: {
                        id: args.id,
                    },
                    data: {
                        name: args.data
                    },
                })
            }
        })

        t.field('updateProfile', {
            type: 'profile',
            args: {
                id: nonNull(stringArg()),
                data: nonNull(stringArg()),
            },
            resolve: (_, args) => {
                profileLoader.clear(args.id);
                return prisma.profile.update({
                    where: {
                        id: args.id,
                    },
                    data: {
                        bio: args.data
                    },
                })
            }
        })

        t.field('upsert', {
            type: 'profile',
            args: {
                id: nonNull(stringArg()),
                bio: nonNull(stringArg()),
                client_id: nonNull(stringArg()),
                
            },
            resolve:async(_, args) => {
               
               return await prisma.profile.upsert({
                where: {
                    id: args.id,
                },
                create: {
                    
                    bio:args.bio,
                    client:{
                        connect:{
                            id: args.client_id,
                        }
                    }
                   
                },
                update: {
                    bio:args.bio,
                    
                }
                   
                });  
            }
        });

        // t.field('softDeleteClient', {
        //     type: 'client',
        //     args: {
        //         id: nonNull(stringArg()),
        //     },
        //     resolve:async (_, args) => {
               
        //        return await prisma.profile.update({
        //         where: {
        //             id: args.id,
        //         },
        //         data: {
        //             is_deleted: true,
        //         },
                   
        //         });  
        //     }
        // });
        // t.field('ddd',{
        //     type:'',
        //     args:{
        //         id:,
        //     },
        //     resolve:()=>{
        //         return prisma.profile.update({

        //         })
        //     }

        // })
    },
    
});
 //👇 rawQuery

// async function d(){
//     const name = 'siva';
//     const mail = 'siva12@gmail.com'
//     const user = await prisma.$queryRaw `INSERT INTO client (id,name, email) VALUES (${'7'},${name},${mail});`;
//     console.log(user);
    // seperate code above and below
//     const user = await prisma.$queryRaw `select*from client`
//     user.forEach(i => {
//         console.log(i);
//     });

// }
// d();


const schema = makeSchema({
    types: [client, profile, Query, Mutation]
});

const server = new ApolloServer({
    schema,
    context: () => ({
      loaders: {
        clientLoader,
        profileLoader,
      },
    }),
  });


server.listen(5000, () => {
    console.log("running on 5000");
});
