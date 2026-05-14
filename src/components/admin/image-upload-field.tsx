"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadImageAction } from "@/app/admin/upload-actions";

// A drop-in image field for admin forms. The visible text input (name={name})
// is the source of truth the surrounding <form> submits — the upload button
// just fills it in. Works without Cloudinary too: paste a URL by hand.
export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const showPreview = /^https?:\/\//i.test(url);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked later
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const result = await uploadImageAction(fd);
      if (result.ok) setUrl(result.url);
      else setError(result.error);
    });
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex flex-wrap items-start gap-3">
        {showPreview ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-platinum-200 bg-platinum-100">
            <Image
              src={url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setUrl("")}
              className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-dashed border-platinum-300 bg-platinum-50 text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1.5">
          <Input
            id={name}
            name={name}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… or upload below"
            className="h-11"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
            className="h-9 gap-1.5 rounded-full"
          >
            {pending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="h-3.5 w-3.5" /> Upload image
              </>
            )}
          </Button>
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
