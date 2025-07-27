"use client";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import {
  SignInButton as FarcasterSignInButton,
  StatusAPIResponse,
} from "@farcaster/auth-kit";
import { useCallback } from "react";
import { Button, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function LoginPage() {
  const { data: session } = useSession();

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();

    if (!nonce) throw new Error("Unable to generate nonce");

    return nonce;
  }, []);

  const handleFarcasterSuccess = useCallback((res: StatusAPIResponse) => {
    signIn("credentials", {
      message: res.message,
      signature: res.signature,
      name: res.username,
      pfp: res.pfpUrl,
      redirect: false,
    });
    addToast({
      title: "Farcaster is connected!",
      description: `UID: ${res.fid}`,
      color: "secondary",
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-default-50 p-8 rounded-lg shadow-lg flex flex-col items-center gap-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">Sign in to Foretell</h2>
        <>
          <div className="w-full flex flex-col items-center gap-2">
            <Button
              className="w-full"
              disabled={
                !!session && (session as any).user?.provider === "twitter"
              }
              radius="full"
              size="lg"
              variant="flat"
              onPress={() => signIn("twitter")}
            >
              <Icon className="mr-2" icon="hugeicons:new-twitter" width={24} />
              {session && (session as any).user?.provider === "twitter"
                ? `Connected as ${(session as any).user?.name || (session as any).user?.id}`
                : "Sign in with Twitter"}
            </Button>
          </div>

          <div className="w-full flex flex-col items-center gap-2">
            <FarcasterSignInButton
              nonce={getNonce}
              onSignOut={() => signOut()}
              onSuccess={handleFarcasterSuccess}
            />
          </div>
          {/* Sign out */}
          {session && (
            <Button
              className="mt-4"
              color="danger"
              radius="full"
              size="sm"
              variant="flat"
              onPress={() => signOut()}
            >
              Sign out
            </Button>
          )}
        </>
      </div>
    </div>
  );
}
