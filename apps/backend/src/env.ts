import z from "zod";

const envSchema = z.object({
  AUTHENTICATION_DATABASE_URL: z.string().min(1),
  AUTHORIZATION_DATABASE_URL: z.string().min(1),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error(envResult.error.issues);
  process.exit(1);
}

export const env = envResult.data;
