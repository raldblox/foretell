"use client";

import React from "react";
import { Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

export type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: string;
  showFeedback?: boolean;
  message?: React.ReactNode;
  messageClassName?: string;
  polarity?: -1 | 0 | 1;
};

const MessageCard = React.forwardRef<HTMLDivElement, MessageCardProps>(
  (
    { avatar, message, polarity, className, messageClassName, ...props },
    ref
  ) => {
    const messageRef = React.useRef<HTMLDivElement>(null);

    return (
      <div {...props} ref={ref} className={cn("flex gap-3", className)}>
        <div className="relative flex-none">
          <Badge
            isOneChar
            color={
              polarity === 1 ? "success" : polarity === 0 ? "warning" : "danger"
            }
            content=""
            placement="bottom-right"
            shape="circle"
          >
            <Icon
              className="p-2 border rounded-full"
              height="36"
              icon="hugeicons:anonymous"
              width="36"
            />
          </Badge>
        </div>
        <div className="flex w-full flex-col gap-4">
          <div
            className={cn(
              "relative w-full rounded-medium bg-default-100 px-4 py-3 text-default-600",
              messageClassName
            )}
          >
            <div ref={messageRef} className={"pr-6 text-small"}>
              {message}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default MessageCard;

MessageCard.displayName = "MessageCard";
