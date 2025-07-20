"use client";

import React, { useState, useContext } from "react";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Button,
  Input,
  Textarea,
  useDisclosure,
  DatePicker,
  Switch,
  Spacer,
  ModalFooter,
  Link,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

import { AppContext } from "@/app/providers";
import { Survey } from "@/hooks/useForetell";
import ConnectButton from "@/components/connect";

const SurveySchema = z.object({
  surveyId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  expiry: z.string().optional(),
  maxResponses: z.number().optional(),
  responses: z.array(z.any()).optional(),
  allowAnonymity: z.boolean().optional(),
  discoverable: z.boolean().optional(),
});

export default function CreateSurveyModal({
  onSuccess,
  fullWidth,
  size,
  customMessage,
}: {
  onSuccess?: () => void;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  customMessage?: string;
}) {
  const { setSurveys, setIdx, userId } = useContext(AppContext)!;
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    expiry: "",
    maxResponses: "",
    allowAnonymity: true,
    discoverable: true,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExpiryChange = (value: any) => {
    // Only update if value is a valid date (has a toDate method and year is reasonable)
    if (value && typeof value.toDate === "function") {
      const date = value.toDate();
      // Format as YYYY-MM-DD
      const dateStr = date.toISOString().split("T")[0];

      setForm({ ...form, expiry: dateStr });

      return;
    }
    // If not valid, clear expiry
    setForm({ ...form, expiry: "" });
  };

  const handleToggleAnonymity = (value: boolean) => {
    setForm((prev) => ({ ...prev, allowAnonymity: value }));
  };

  const handleToggleDiscoverable = (value: boolean) => {
    setForm((prev) => ({ ...prev, discoverable: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError("You must be logged in to create a survey.");
      setLoading(false);

      return;
    }
    const parsed = SurveySchema.safeParse({
      surveyId: nanoid(),
      title: form.title,
      description: form.description,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      expiry: form.expiry ? new Date(form.expiry).toISOString() : undefined,
      maxResponses: form.maxResponses ? Number(form.maxResponses) : undefined,
      responses: [],
      allowAnonymity: form.allowAnonymity,
      discoverable: form.discoverable,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);

      return;
    }
    setLoading(true);
    const survey = parsed.data;

    console.log("Creating survey:", survey);

    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(survey),
    });

    setLoading(false);
    if (res.ok) {
      // Fetch latest surveys and update context
      const updated = await fetch("/api/survey");

      if (updated.ok) {
        const data = await updated.json();

        setSurveys((prev: Survey[]) => {
          const updated = [...prev, survey];

          setIdx(updated.length - 1);

          return updated;
        });
      }
      setForm({
        title: "",
        description: "",
        expiry: "",
        maxResponses: "",
        allowAnonymity: false,
        discoverable: true,
      });
      if (onSuccess) onSuccess();
      onClose();
    } else {
      const data = await res.json();
      let errorMsg = "Failed to create survey";

      if (typeof data.error === "string") {
        errorMsg = data.error;
      } else if (data.error?.formErrors?.length) {
        errorMsg = data.error.formErrors.join(", ");
      } else if (data.error?.fieldErrors) {
        errorMsg = Object.values(data.error.fieldErrors).flat().join(", ");
      }
      setError(errorMsg);
    }
  }

  return (
    <>
      <Button
        className="bg-default-foreground text-small font-medium leading-5 text-background"
        radius="full"
        size={size}
        onPress={onOpen}
        fullWidth={fullWidth}
        // startContent={<Logo size={26} />}
      >
        {customMessage ? customMessage : "Create survey on Foretell"}
      </Button>

      <Modal
        hideCloseButton
        isDismissable
        className="m-6"
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center w-full mt-3">
            <h1>New Survey</h1>
            <span>{userId && <ConnectButton size="sm" />}</span>
          </ModalHeader>
          <ModalBody>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <Textarea
                isRequired
                label="Insert topic or ask question"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
              <DatePicker
                hideTimeZone
                isRequired
                showMonthAndYearPickers
                label="Expiry"
                name="expiry"
                value={form.expiry ? parseDate(form.expiry) : null}
                onChange={handleExpiryChange}
              />
              <Input
                isRequired
                label="Maximum Responses"
                name="maxResponses"
                type="number"
                value={form.maxResponses}
                onChange={handleChange}
              />
              <Spacer y={3} />
              <Switch
                color="primary"
                isSelected={form.allowAnonymity}
                size="sm"
                onValueChange={handleToggleAnonymity}
              >
                Allow Anonymous Responses
              </Switch>
              <Switch
                color="primary"
                isSelected={form.discoverable}
                size="sm"
                onValueChange={handleToggleDiscoverable}
              >
                Discoverable (show in browse)
              </Switch>
              <Spacer y={3} />
              {error && <div className="text-danger text-sm">{error}</div>}
              {userId ? (
                <div className="flex items-center gap-1 w-full">
                  <Button
                    color="default"
                    isLoading={loading}
                    size="lg"
                    type="submit"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    color="primary"
                    isLoading={loading}
                    size="lg"
                    type="submit"
                  >
                    Create Survey
                  </Button>
                </div>
              ) : (
                <ConnectButton size="lg" />
              )}
            </form>
          </ModalBody>
          <ModalFooter className="flex justify-center items-center pb-6">
            <Link
              isExternal
              className="text-default-400 text-xs"
              href="https://onchainsupply.net?utm_source=foretell&utm_medium=modal&utm_campaign=powered_by"
              title="heroui.com homepage"
            >
              Powered by OnChainSupply
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
