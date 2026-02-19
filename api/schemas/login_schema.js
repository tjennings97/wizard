import * as z from "zod"
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const loginSchema = z.object({
  username: z.string().min(1).openapi({
    example: "username123"
  }),
  password: z.string().min(1).openapi({
    example: "password123"
  })
}).openapi('Login');
