import { Button, Image, Link, Spacer } from "@heroui/react";
import CreateSurveyModal from "@/actions/create-survey";

export default function Hero() {
  return (
    <section
      className="container py-6 mb-8 z-10 mx-auto max-w-7xl flex flex-col items-center justify-center gap-[18px] p-6"
      id="hero"
    >
      <div className="flex max-w-2xl flex-col text-center">
        <h1 className="bg-hero-section-title text-4xl md:text-5xl bg-clip-text font-medium text-balance text-transparent dark:from-[#FFFFFF] dark:to-[#ffffffcd]">
          Surveys, Markets & Rewards in One Foretell
        </h1>
        <Spacer y={4} />
        <h2 className="text-large text-default-500 text-balance">
          Ask anything, open a live 3-way market, and automate distribution of
          rewards—no extra tools required.
        </h2>
        <Spacer y={4} />
        <div className="flex w-full flex-wrap justify-center gap-2">
          <CreateSurveyModal />
          <Button
            isExternal
            as={Link}
            className="bg-[#6746f9] text-white flex items-center gap-2"
            href="https://farcaster.xyz/miniapps/ibjZObityvsY/foretell"
            radius="full"
            variant="solid"
          >
            <Image
              alt="Farcaster"
              height={18}
              src="/farcaster.svg"
              width={18}
            />
            Launch on Farcater
          </Button>
        </div>
      </div>
    </section>
  );
}
