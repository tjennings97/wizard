import * as z from "zod"
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { room_idSchema } from '../schemas/room_schema.js'
import { user_idSchema } from '../schemas/user_schema.js'

extendZodWithOpenApi(z);

const gameStatusSchema = z.enum(["active", "completed", "stale"]).openapi({ example: 'active' });
const game_idSchema = z.coerce.number().int().openapi({ example: 1 });

const createGameSchema = z.object({
  room_id: room_idSchema,
  status: gameStatusSchema
});

const finalStateSchema = z.array(
  z.object({
    user_id: user_idSchema,
    score: z.number().int(),
  })
).min(1, "finalState cannot be an empty array");

const updateGameSchema = z.object({
  status: gameStatusSchema,
  winneruser_id: user_idSchema.optional(),
  finalState: finalStateSchema.optional()
});

const gameResponseSchema = z.object({
  id: game_idSchema,
  room_id: room_idSchema,
  status: gameStatusSchema,
  winner_user_id: user_idSchema.nullable(),
  final_state: finalStateSchema.nullable(),
  created: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  }),
  updated: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  })
}).openapi('Game')

const gamesResponseSchema = z.array(gameResponseSchema)
  .min(1)
  .openapi('Games');

export { createGameSchema, game_idSchema, updateGameSchema,
  gameResponseSchema, gamesResponseSchema
 }
