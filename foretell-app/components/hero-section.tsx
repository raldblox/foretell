"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";

import GradientText from "./ui/gradient-text";

const Hero = () => {
  return (
    <section className="container mx-auto max-w-7xl z-20 my-14 flex flex-col items-center justify-center gap-[18px] sm:gap-6">
      <GradientText
        animationSpeed={2}
        className="border-1 border-default-100 px-[18px] py-2 text-small font-normal leading-5 rounded-full"
        colors={["#feff94", "#e8ffc1", "#9ef5cf", "#51dacf", "#0278ae"]}
        showBorder={false}
      >
        ALL IN ONE $FORETELL
      </GradientText>

      <div className="text-center text-[clamp(40px,10vw,44px)] font-bold leading-[1.2] tracking-tighter sm:text-[64px]">
        {/* 
              NOTE: To use `bg-hero-section-title`, you need to add the following to your tailwind config.
              ```
              backgroundImage: {
                "hero-section-title":
                  "linear-gradient(91deg, #FFF 32.88%, rgba(255, 255, 255, 0.40) 99.12%)",
              },
              ```
            */}
        <div className="bg-hero-section-title bg-clip-text text-balance text-transparent dark:from-[#FFFFFF] dark:to-[#FFFFFF66]">
          Answer Surveys. Stake Predictions. Earn Rewards.
        </div>
      </div>
      <p className="text-center text-default-500 max-w-2xl">
        Foretell brings online surveys, live three-way markets, and automated
        payouts into one seamless platform. Collect any feedback (reviews,
        comments, insights), let your community bet on outcomes, and distribute
        fair rewards—no extra tools required.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
        <Button
          className="h-10 w-[163px] bg-default-foreground px-[16px] py-[10px] text-small font-medium leading-5 text-background"
          radius="full"
        >
          Create Survey
        </Button>
        <Button
          className="h-10 w-[163px] border-1 border-default-100 px-[16px] py-[10px] text-small font-medium leading-5"
          endContent={
            <span className="pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded-full bg-default-100">
              <Icon
                className="text-default-500 [&>path]:stroke-[1.5]"
                icon="solar:arrow-right-linear"
                width={16}
              />
            </span>
          }
          radius="full"
          variant="bordered"
        >
          See our plans
        </Button>
      </div>
    </section>
  );
};

export default Hero;
