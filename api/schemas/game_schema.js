import * as z from "zod"

const gameStatusSchema = z.enum(["active", "completed", "stale"]);

const createGameSchema = z.object({
  roomId: z.coerce.number().int(),
  status: gameStatusSchema
});

const gameIdSchema = z.object({
  id: z.coerce.number().int()
})

const finalStateSchema = z.array(
  z.object({
    userId: z.coerce.number().int(),
    score: z.number().int(),
  })
).min(1, "finalState cannot be an empty array");

const updateGameSchema = z.object({
  status: gameStatusSchema,
  winnerUserId: z.coerce.number().int().optional(),
  finalState: finalStateSchema.optional()
});

export { createGameSchema, gameIdSchema, updateGameSchema }
