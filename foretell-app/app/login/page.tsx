"use client";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import {
  SignInButton as FarcasterSignInButton,
  SignInButton,
  StatusAPIResponse,
} from "@farcaster/auth-kit";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useEffect, useState } from "react";
import { Button, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const { isFrameReady: isCoinbase } = useMiniKit();
  const [error, setError] = useState(false);

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
        {/* Coinbase (if present, only show this) */}
        {isCoinbase ? (
          <div className="w-full flex flex-col items-center gap-2">
            <Button
              radius="full"
              size="lg"
              className="w-full"
              variant="flat"
              // onPress={...}
              disabled
            >
              {/* Add your Coinbase connect logic here */}
              Sign in with Coinbase (coming soon)
            </Button>
            {session && (session.user as any)?.provider === "coinbase" && (
              <div className="text-success">
                Connected as {session.user?.name || session.user?.id}
              </div>
            )}
            {session && (
              <Button
                color="danger"
                radius="full"
                size="sm"
                variant="flat"
                className="mt-4"
                onPress={() => signOut()}
              >
                Sign out
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="w-full flex flex-col items-center gap-2">
              <Button
                radius="full"
                size="lg"
                className="w-full"
                variant="flat"
                onPress={() => signIn("twitter")}
                disabled={
                  !!session && (session as any).user?.provider === "twitter"
                }
              >
                <Icon
                  className="mr-2"
                  icon="hugeicons:new-twitter"
                  width={24}
                />
                {session && (session as any).user?.provider === "twitter"
                  ? `Connected as ${(session as any).user?.name || (session as any).user?.id}`
                  : "Sign in with Twitter"}
              </Button>
            </div>

            <div className="w-full flex flex-col items-center gap-2">
              <FarcasterSignInButton
                nonce={getNonce}
                onSuccess={handleFarcasterSuccess}
                onError={() => setError(true)}
                onSignOut={() => signOut()}
              />
            </div>
            {/* Sign out */}
            {session && (
              <Button
                color="danger"
                radius="full"
                size="sm"
                variant="flat"
                className="mt-4"
                onPress={() => signOut()}
              >
                Sign out
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
