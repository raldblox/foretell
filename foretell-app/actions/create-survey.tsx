"use client";

import React, { useState, useContext } from "react";
import { nanoid } from "nanoid";
import { z } from "zod";
import { useSession } from "next-auth/react";
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
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

import { AppContext } from "@/app/providers";
import { Survey } from "@/hooks/useForetell";

const SurveySchema = z.object({
  surveyId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  expiry: z.string().optional(),
  maxResponses: z.number().optional(),
  responses: z.array(z.any()).optional(),
});

export default function CreateSurveyModal({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    expiry: "",
    maxResponses: "",
  });
  const { setSurveys, setIdx } = useContext(AppContext)!;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!session?.user?.id) {
      setError("You must be logged in to create a survey.");
      setLoading(false);

      return;
    }
    const parsed = SurveySchema.safeParse({
      surveyId: nanoid(),
      title: form.title,
      description: form.description,
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      expiry: form.expiry ? new Date(form.expiry).toISOString() : undefined,
      maxResponses: form.maxResponses ? Number(form.maxResponses) : undefined,
      responses: [],
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
        className="h-10 w-[163px] bg-default-foreground px-[16px] py-[10px] text-small font-medium leading-5 text-background"
        radius="full"
        onPress={onOpen}
      >
        Create Survey
      </Button>
      <Modal
        className="m-6"
        placement="top-center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>Create New Survey</ModalHeader>
          <ModalBody>
            <form className="flex flex-col gap-3 pb-6" onSubmit={handleSubmit}>
              <Input
                isRequired
                required
                label="Title"
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
                label="Expiry (optional)"
                name="expiry"
                value={form.expiry ? parseDate(form.expiry) : null}
                onChange={handleExpiryChange}
              />

              <Input
                isRequired
                label="Max Responses (optional)"
                name="maxResponses"
                type="number"
                value={form.maxResponses}
                onChange={handleChange}
              />
              {error && <div className="text-danger text-sm">{error}</div>}
              <Button color="primary" isLoading={loading} type="submit">
                Create Survey
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
