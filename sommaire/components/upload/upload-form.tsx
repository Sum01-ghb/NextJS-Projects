"use client";
import React from "react";
import { z } from "zod";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./upload-form-input";
import { toast } from "sonner";

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
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}
