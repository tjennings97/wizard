import * as z from "zod";
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const user_idSchema = z.coerce.number().int().openapi({ example: 1 });
const userRoleSchema = z.enum(["admin", "player"]).openapi({ example: 'player'})
const usernameSchema = z.string().min(3).openapi({ example: 'username'});
const emailSchema = z.email().optional().openapi({ example: 'test@test.com'});
const passwordSchema = z.string().min(8).openapi({ example: 'password' });

const createUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema
});

const updateUserSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional()
}).check(
  z.refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to update",
  })
);

const userIdSchema = z.object({
  id: z.coerce.number().int()
})

const userResponseSchema = z.object({
  id: user_idSchema,
  username: usernameSchema,
  email: emailSchema,
  role: userRoleSchema, 
  created: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  }),
  updated: z.iso.datetime().openapi({
    example: '2026-02-03T20:50:28.004Z',
    format: "date-time"
  })
})
  .openapi('User');

const usersResponseSchema = z.array(userResponseSchema)
  .min(1)
  .openapi('Users');

export { createUserSchema, updateUserSchema, userIdSchema, user_idSchema,
  userResponseSchema, usersResponseSchema
 }
