import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAppClient, viemConnector } from "@farcaster/auth-client";

declare module "next-auth" {
  interface User {
    id?: string;
  }
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    CredentialsProvider({
      name: "Farcaster",
      credentials: {
        message: { label: "Message", type: "text", placeholder: "0x0" },
        signature: { label: "Signature", type: "text", placeholder: "0x0" },
        name: { label: "Name", type: "text", placeholder: "0x0" },
        pfp: { label: "Pfp", type: "text", placeholder: "0x0" },
      },
      async authorize(credentials, req) {
        // Get CSRF token as nonce
        const csrfToken = req.body?.csrfToken;
        const appClient = createAppClient({
          ethereum: viemConnector(),
        });
        const verifyResponse = await appClient.verifySignInMessage({
          message: credentials?.message as string,
          signature: credentials?.signature as `0x${string}`,
          domain: process.env.NEXTAUTH_URL || "localhost",
          nonce: csrfToken,
        });
        const { success, fid } = verifyResponse;

        if (!success) return null;

        return {
          id: fid.toString(),
          name: credentials?.name,
          image: credentials?.pfp,
          provider: "farcaster",
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.sub;
      if (token.name) session.user.name = token.name;
      if (token.picture) session.user.image = token.picture;
      if (token.provider) session.user.provider = token.provider;

      return session;
    },
    async jwt({ token, account }: { token: any; account: any }) {
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
