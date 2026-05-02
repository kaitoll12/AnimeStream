import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import Redis from "ioredis"
import bcrypt from "bcryptjs"

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ""
const redis = redisUrl ? new Redis(redisUrl) : null

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales inválidas")
        }

        if (!redis) {
          throw new Error("Error de conexión a la base de datos")
        }

        const userKey = `user:${credentials.email.toLowerCase()}`
        const userDataStr = await redis.get(userKey)

        if (!userDataStr) {
          throw new Error("El usuario no existe")
        }

        const user = JSON.parse(userDataStr)
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta")
        }

        return {
          id: user.id || credentials.email,
          name: user.username,
          email: user.email,
          image: user.image || null,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // If signing in with Google, ensure user exists in Redis
      if (account?.provider === "google") {
        if (!redis) return false;

        const email = user.email?.toLowerCase();
        if (!email) return false;

        const userKey = `user:${email}`;
        const userDataStr = await redis.get(userKey);

        if (!userDataStr) {
          // Create new user from Google profile
          const newUser = {
            id: user.id,
            email: email,
            username: user.name || email.split("@")[0],
            image: user.image,
            provider: "google"
          }
          await redis.set(userKey, JSON.stringify(newUser));
        } else {
          // Optionally update existing user's image or name if needed, but not strictly necessary
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        // Since Google provider sets 'name', we can just use it as 'username'
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
      }
      return session;
    }
  },
  pages: {
    signIn: '/', // Will be handled by our custom modal, but just in case
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development_only_123",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
