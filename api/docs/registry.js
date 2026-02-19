import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'

import { loginSchema } from '../schemas/login_schema.js';
import {
    userResponseSchema,
    usersResponseSchema,
    user_idSchema,
    createUserSchema,
    updateUserSchema
} from '../schemas/user_schema.js'
import {
    roomResponseSchema,
    roomsResponseSchema,
    room_idSchema,
    updateRoomSchema,
    roomMembersResponseSchema,
    roomMemberResponseSchema,
    createRoomMemberSchema
} from '../schemas/room_schema.js'
import {
    gamesResponseSchema,
    gameResponseSchema,
    createGameSchema,
    game_idSchema,
    updateGameSchema
} from '../schemas/game_schema.js';
import * as z from "zod";

const registry = new OpenAPIRegistry()

// Define the Bearer Auth structure
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
});

// Register post login path
registry.registerPath({
    method: "post",
    path: "/login",
    tags: ["Auth"],
    summary: "Authenticate user and return JWT",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: loginSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: "Login successful",
            content: {
                "application/json": {
                    schema: z.object({
                        token: z.string().openapi({
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        })
                    })
                }
            }
        },
        401: {
            description: "Invalid credentials"
        }
    }
});

// Register get users path
registry.registerPath({
    method: "get",
    path: "/users",
    tags: ["Users"],
    summary: "Returns list of users",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Users retrieved successfully",
            content: {
                "application/json": {
                    schema: usersResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized"
        },
        404: {
            description: "no users found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register get user path
registry.registerPath({
    method: "get",
    path: "/users/{id}",
    tags: ["Users"],
    summary: "Returns specified user",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: user_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        }),
    },
    responses: {
        200: {
            description: "User retrieved successfully",
            content: {
                "application/json": {
                    schema: userResponseSchema,
                },
            },
        },
        400: {
            description: "invalid id"
        },
        404: {
            description: "provided id not found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register post user path
registry.registerPath({
    method: "post",
    path: "/users",
    tags: ["Users"],
    summary: "Create new user",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createUserSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: "User created successfully",
            content: {
                "application/json": {
                    schema: userResponseSchema,
                },
            },
        },
        400: {
            description: "client error"
        },
        409: {
            description: "User already exists"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register put user path
registry.registerPath({
    method: "put",
    path: "/users/{id}",
    tags: ["Users"],
    summary: "Modify specified user",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: user_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        }),
        body: {
            content: {
                "application/json": {
                    schema: updateUserSchema
                }
            }
        }
    },
    responses: {
        204: {
            description: "User modified successfully"
        },
        400: {
            description: "client error"
        },
        404: {
            description: "provided id not found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register delete user path
registry.registerPath({
    method: "delete",
    path: "/users/{id}",
    tags: ["Users"],
    summary: "Delete specified user",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: user_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        })
    },
    responses: {
        204: {
            description: "User deleted successfully"
        },
        400: {
            description: "client error"
        },
        404: {
            description: "provided id not found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register get rooms path
registry.registerPath({
    method: "get",
    path: "/rooms",
    tags: ["Rooms"],
    summary: "Returns list of rooms",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Rooms retrieved successfully",
            content: {
                "application/json": {
                    schema: roomsResponseSchema,
                },
            },
        },
        404: {
            description: "no rooms found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register post room path
registry.registerPath({
    method: "post",
    path: "/rooms",
    tags: ["Rooms"],
    summary: "Create new room",
    security: [{ bearerAuth: [] }],
    responses: {
        201: {
            description: "Room created successfully",
            content: {
                "application/json": {
                    schema: roomResponseSchema,
                },
            },
        },
        400: {
            description: "Room maximum reached"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register get room path
registry.registerPath({
    method: "get",
    path: "/rooms/{id}",
    tags: ["Rooms"],
    summary: "Returns specified room",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: room_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        }),
    },
    responses: {
        200: {
            description: "Room retrieved successfully",
            content: {
                "application/json": {
                    schema: roomResponseSchema,
                },
            },
        },
        400: {
            description: "invalid id"
        },
        404: {
            description: "provided id not found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register put room path
registry.registerPath({
    method: "put",
    path: "/rooms/{id}",
    tags: ["Rooms"],
    summary: "Modify specified room",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: room_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        }),
        body: {
            content: {
                "application/json": {
                    schema: updateRoomSchema
                }
            }
        }
    },
    responses: {
        204: {
            description: "Room modified successfully"
        },
        400: {
            description: "client error"
        },
        404: {
            description: "provided id not found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register get members path
registry.registerPath({
    method: "get",
    path: "/rooms/{id}/members",
    tags: ["RoomMembers"],
    summary: "Returns specified room's members",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: room_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        }),
    },
    responses: {
        200: {
            description: "Room's members retrieved successfully",
            content: {
                "application/json": {
                    schema: roomMembersResponseSchema,
                },
            },
        },
        400: {
            description: "invalid id"
        },
        404: {
            description: "no room members found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register post room member path
registry.registerPath({
    method: "post",
    path: "/rooms/{room_id}/members",
    tags: ["RoomMembers"],
    summary: "Add user to room",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            room_id: room_idSchema.openapi({
                example: 1,
                param: {
                    name: "room_id",
                    in: "path",
                    required: true,
                }
            })
        }),
        body: {
            content: {
                "application/json": {
                    schema: createRoomMemberSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: "Room member added successfully",
            content: {
                "application/json": {
                    schema: roomMemberResponseSchema,
                },
            },
        },
        400: {
            description: "client error"
        },
        409: {
            description: "User already exists in a room"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register get room members path
registry.registerPath({
    method: "get",
    path: "/rooms/{room_id}/members/{user_id}",
    tags: ["RoomMembers"],
    summary: "Returns specified room member",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            room_id: room_idSchema.openapi({
                example: 1,
                param: {
                    name: "room_id",
                    in: "path",
                    required: true,
                },
            }),
            user_id: user_idSchema.openapi({
                example: 1,
                param: {
                    name: "user_id",
                    in: "path",
                    required: true,
                },
            })
        }),
    },
    responses: {
        200: {
            description: "Room member retrieved successfully",
            content: {
                "application/json": {
                    schema: roomMemberResponseSchema,
                },
            },
        },
        400: {
            description: "invalid id"
        },
        404: {
            description: "no room member found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register delete room members path
registry.registerPath({
    method: "delete",
    path: "/rooms/{room_id}/members/{user_id}",
    tags: ["RoomMembers"],
    summary: "Remove specified user from specified room",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            room_id: room_idSchema.openapi({
                example: 1,
                param: {
                    name: "room_id",
                    in: "path",
                    required: true,
                },
            }),
            user_id: user_idSchema.openapi({
                example: 1,
                param: {
                    name: "user_id",
                    in: "path",
                    required: true,
                },
            })
        }),
    },
    responses: {
        204: {
            description: "Room member deleted successfully"
        },
        400: {
            description: "invalid id"
        },
        404: {
            description: "no room member found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register get games path
registry.registerPath({
    method: "get",
    path: "/games",
    tags: ["Games"],
    summary: "Returns list of games",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "games retrieved successfully",
            content: {
                "application/json": {
                    schema: gamesResponseSchema,
                },
            },
        },
        404: {
            description: "no games found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register post game path
registry.registerPath({
    method: "post",
    path: "/games",
    tags: ["Games"],
    summary: "Create new game",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createGameSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: "Game created successfully",
            content: {
                "application/json": {
                    schema: gameResponseSchema,
                },
            },
        },
        400: {
            description: "client error"
        },
        409: {
            description: "There is already an active game in the room"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register get game path
registry.registerPath({
    method: "get",
    path: "/games/{id}",
    tags: ["Games"],
    summary: "Returns specified game",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: game_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        }),
    },
    responses: {
        200: {
            description: "Game retrieved successfully",
            content: {
                "application/json": {
                    schema: gameResponseSchema,
                },
            },
        },
        400: {
            description: "invalid id"
        },
        404: {
            description: "provided id not found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

// Register put game path
registry.registerPath({
    method: "put",
    path: "/games/{id}",
    tags: ["Games"],
    summary: "Modify specified game",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: game_idSchema.openapi({
                example: 1,
                param: {
                    name: "id",
                    in: "path",
                    required: true,
                },
            })
        }),
        body: {
            content: {
                "application/json": {
                    schema: updateGameSchema
                }
            }
        }
    },
    responses: {
        204: {
            description: "Game modified successfully"
        },
        400: {
            description: "client error"
        },
        404: {
            description: "provided id not found"
        },
        500: {
            description: "Internal server error"
        }
    }
});

function generateOpenApiDocument() {
    const generator = new OpenApiGeneratorV3(registry.definitions)

    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            title: "Wizard App API",
            version: "1.0.0",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    })
}

export { generateOpenApiDocument }
