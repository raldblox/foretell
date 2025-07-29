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
import { etherlinkTestnet } from "viem/chains";

import { AppContext } from "@/app/providers";
import ConnectButton from "@/components/connect";
import { Survey } from "@/types";

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
    >,
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
    const newSurveyId = nanoid();
    const parsed = SurveySchema.safeParse({
      surveyId: newSurveyId,
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
    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(survey),
    });

    setLoading(false);
    if (res.ok) {
      // Create vault
      const chainId = etherlinkTestnet.id; // Etherlink Testnet Chain ID
      const vaultRes = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: newSurveyId, chainId }),
      });

      if (vaultRes.ok) {
        const { vaultAddress } = await vaultRes.json();

        console.log(vaultAddress);
        // Update survey with vaultAddress and chainId
        const updateRes = await fetch("/api/survey", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surveyId: newSurveyId,
            chainId,
            vaultAddress,
          }),
        });

        if (!updateRes.ok) {
          const errorData = await updateRes.json();

          console.error(
            "Failed to update survey with vault details:",
            errorData,
          );
          setError(
            `Failed to update survey with vault details: ${errorData.error || updateRes.statusText}`,
          );
          setLoading(false);

          return;
        }
      } else {
        const errorData = await vaultRes.json();

        console.error("Failed to create vault:", errorData);
        setError(
          `Failed to create vault: ${errorData.error || vaultRes.statusText}`,
        );
        setLoading(false);

        return;
      }

      // Fetch latest surveys and update context
      const updated = await fetch("/api/survey");

      if (updated.ok) {
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
        fullWidth={fullWidth}
        radius="full"
        size={size}
        onPress={onOpen}
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

              <div className="flex items-center gap-1 w-full">
                <Button
                  color="default"
                  isLoading={loading}
                  radius="full"
                  size="lg"
                  type="submit"
                  variant="flat"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                {userId ? (
                  <Button
                    fullWidth
                    color="primary"
                    isLoading={loading}
                    radius="full"
                    size="lg"
                    type="submit"
                  >
                    Create Survey
                  </Button>
                ) : (
                  <ConnectButton fullWidth size="lg" />
                )}
              </div>
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
