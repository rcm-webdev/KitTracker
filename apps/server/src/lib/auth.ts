import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "../db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    storeSessionInDatabase: true,
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh if older than 1 day
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
  ],
  trustedOrigins: [
    process.env.CLIENT_URL!,
  ],
});

export type Session = typeof auth.$Infer.Session;
