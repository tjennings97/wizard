import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import * as z from "zod";

extendZodWithOpenApi(z);

const room_idSchema = z.coerce.number().int().openapi({ example: 1 });
const user_idSchema = z.coerce.number().int().openapi({ example: 1 });
const roomStatusSchema = z.enum(["open", "waiting", "playing", "finished", "stale"]).openapi({ example: 'open' });
const roomMemberRoleSchema = z.enum(["player", "spectator"]).openapi({ example: 'player' });

const updateRoomSchema = z.object({
  status: roomStatusSchema.optional(),
})
  .check(
    z.refine((data) => Object.keys(data).length > 0, {
      message: "Provide at least one valid field to update",
    })
  )
  .openapi('UpdateRoom');

const createRoomMemberSchema = z.object({
  user_id: user_idSchema,
  role: roomMemberRoleSchema
})
.openapi('UpdateRoomMember');

const roomResponseSchema = z.object({
  id: room_idSchema,
  status: roomStatusSchema,
  created: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  }),
  updated: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  })
})
  .openapi('Room');

const roomsResponseSchema = z.array(roomResponseSchema)
  .min(1)
  .openapi('Rooms');

const roomMemberResponseSchema = z.object({
  room_id: room_idSchema,
  user_id: user_idSchema,
  role: roomMemberRoleSchema,
  seat_number: z.coerce.number().int().openapi({ example: 1 }),
  created: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  }),
  updated: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  })
})
  .openapi('RoomMember')

const roomMembersResponseSchema = z.array(roomMemberResponseSchema)
  .min(1)
  .openapi('RoomMembers');

export {
  room_idSchema, user_idSchema, updateRoomSchema, createRoomMemberSchema,
  roomResponseSchema, roomsResponseSchema, roomMemberResponseSchema, roomMembersResponseSchema
}
