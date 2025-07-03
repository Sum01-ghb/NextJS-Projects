"use client";
import React, { useRef, useState } from "react";
import { z } from "zod";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./upload-form-input";
import { toast } from "sonner";
import {
  generatePdfSummary,
  storePdfSummaryAction,
} from "@/actions/upload-actions";
import { useRouter } from "next/navigation";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid File" })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "File size must be less than 20MB"
    )
    .refine(
      (file) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});

export default function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("uploaded successfully!");
    },
    onUploadError: (err) => {
      console.error("error occured while uploading", err);
      toast(
        <div>
          <p className="font-semibold text-base">
            ❌ Error occured when uploading
          </p>
          <p className="text-sm text-muted-foreground">{err.message}</p>
        </div>
      );
    },
    onUploadBegin: (file) => {
      console.log("upload has begun for", file);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.currentTarget);
      const file = formData.get("file") as File;

      const validatedFields = schema.safeParse({ file });
      if (!validatedFields.success) {
        toast(
          <div>
            <p className="font-semibold text-base">❌Something went wrong</p>
            <p className="text-sm text-muted-foreground">
              {validatedFields.error.flatten().fieldErrors.file?.[0] ??
                "Invalid File"}
            </p>
          </div>
        );
        setIsLoading(false);
        return;
      }

      toast(
        <div>
          <p className="font-semibold text-base">📄 Uploading PDF</p>
          <p className="text-sm text-muted-foreground">
            We are uploading your PDF!
          </p>
        </div>
      );
      const resp = await startUpload([file]);
      if (!resp) {
        toast(
          <div>
            <p className="font-semibold text-base">⚠️ Upload Failed</p>
            <p className="text-sm text-muted-foreground">
              Please try a different file.
            </p>
          </div>
        );
        setIsLoading(false);
        return;
      }

      toast(
        <div>
          <p className="font-semibold text-base">📄 Processing PDF</p>
          <p className="text-sm text-muted-foreground">
            Hang tight, our AI is reading your document!
          </p>
        </div>
      );

      const result = await generatePdfSummary(resp);
      const { data = null, message = null } = result || {};

      if (data) {
        let storeResult: any;
        toast(
          <div>
            <p className="font-semibold text-base">📄 Saving PDF...</p>
            <p className="text-sm text-muted-foreground">
              Hang tight, we are saving your summary!
            </p>
          </div>
        );

        if (data?.summary) {
          storeResult = await storePdfSummaryAction({
            fileUrl: resp[0].serverData.file.url,
            summary: data.summary,
            title: data.title,
            fileName: file.name,
          });

          toast(
            <div>
              <p className="font-semibold text-base">📄 Summary generated!</p>
              <p className="text-sm text-muted-foreground">
                Your PDF has been successfully summarized and saved!
              </p>
            </div>
          );
          formRef.current?.reset();
          router.push(`/summaries/${storeResult.data.id}`);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error occured", error);
      formRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput
        isLoading={isLoading}
        ref={formRef}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
