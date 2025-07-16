"use client";

import type { TextAreaProps } from "@heroui/react";

import React from "react";
import { Button, Textarea } from "@heroui/react";
import { cn } from "@heroui/react";
import { Tooltip } from "recharts";
import { Icon } from "@iconify/react";

const PromptInput = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ classNames = {}, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        aria-label="Prompt"
        className="min-h-[40px]"
        classNames={{
          ...classNames,
          label: cn("hidden", classNames?.label),
          input: cn("py-0", classNames?.input),
        }}
        minRows={1}
        placeholder="Enter your response"
        radius="lg"
        variant="bordered"
        {...props}
      />
    );
  }
);

const Response = () => {
  const [prompt, setPrompt] = React.useState<string>("");

  return (
    <form className="flex w-full flex-col items-start rounded-medium bg-default-50 transition-colors">
      <PromptInput
        classNames={{
          inputWrapper: "!bg-transparent shadow-none",
          innerWrapper: "relative",
          input: "pt-1 pl-2 pb-6 !pr-10 text-medium",
        }}
        endContent={
          <div className="flex items-end gap-2">
            <Button
              isIconOnly
              color={!prompt ? "default" : "primary"}
              isDisabled={!prompt}
              radius="lg"
              size="sm"
              variant="solid"
            >
              <Icon
                className={cn(
                  "[&>path]:stroke-[2px]",
                  !prompt ? "text-default-600" : "text-primary-foreground"
                )}
                icon="solar:arrow-up-linear"
                width={20}
              />
            </Button>
          </div>
        }
        minRows={3}
        radius="lg"
        value={prompt}
        variant="flat"
        onValueChange={setPrompt}
      />
      <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 pb-4">
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            startContent={
              <Icon
                className="text-default-500"
                icon="solar:paperclip-linear"
                width={18}
              />
            }
            variant="flat"
          >
            Add stake
          </Button>
          {/* <Button
            size="sm"
            startContent={
              <Icon
                className="text-default-500"
                icon="solar:soundwave-linear"
                width={18}
              />
            }
            variant="flat"
          >
            Voice Commands
          </Button>
          <Button
            size="sm"
            startContent={
              <Icon
                className="text-default-500"
                icon="solar:notes-linear"
                width={18}
              />
            }
            variant="flat"
          >
            Templates
          </Button> */}
        </div>
        <p className="py-1 text-tiny text-default-400">{prompt.length}/2000</p>
      </div>
    </form>
  );
};

export default Response;
