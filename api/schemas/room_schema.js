import * as z from "zod";

const roomIdSchema = z.object({
  id: z.coerce.number().int()
})

const roomRoleSchema = z.enum(["open", "waiting", "playing", "finished", "stale"]);

const updateRoomSchema = z.object({
  status: roomRoleSchema.optional(),
})
  .check(
    z.refine((data) => Object.keys(data).length > 0, {
      message: "Provide at least one valid field to update",
    })
  );

const roomMemberRoleSchema = z.enum(["player", "spectator"]);

const createRoomMemberSchema = z.object({
  userId: z.coerce.number().int(),
  role: roomMemberRoleSchema
})

export { roomIdSchema, updateRoomSchema, createRoomMemberSchema }
