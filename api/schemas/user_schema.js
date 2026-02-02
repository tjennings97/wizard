import * as z from "zod"; 

const userRoleSchema = z.enum(["admin", "player"]);

const createUserSchema = z.object({ 
  username: z.string().min(3),
  email: z.email().optional(),
  password: z.string().min(8),
  role: userRoleSchema
});

const updateUserSchema = z.object({
    email: z.email().optional(),
    password: z.string().min(3).optional()
  })
  .check(
    z.refine((data) => Object.keys(data).length > 0, {
      message: "Provide at least one valid field to update",
    })
  );

const userIdSchema = z.object({
    id: z.coerce.number().int()
})

export { createUserSchema, updateUserSchema, userIdSchema }
