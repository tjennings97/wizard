import * as z from "zod"; 

const roomIdSchema = z.object({
    id: z.coerce.number().int()
})

const roomRoleSchema = z.enum(["open", "waiting", "playing", "finished", "stale"]);

const updateRoomSchema = z.object({
    status: roomRoleSchema.optional(),
    playerCount: z.coerce.number().int().min(0).max(8).optional()
  })
  .check(
    z.refine((data) => Object.keys(data).length > 0, {
      message: "Provide at least one valid field to update",
    })
  );

export { roomIdSchema, updateRoomSchema }
