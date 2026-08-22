"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DialogFooter, DialogShell, Field, FormError, Toggle } from "@/components/FormDialog";
import type { MenuItem } from "@/lib/dal";
import { createMenuItem, updateMenuItem, type MenuItemFormState } from "@/lib/menu-actions";

const EMPTY: MenuItemFormState = {};
const MAX_IMAGE_MB = 5;

export default function MenuItemDialog({
  open,
  onClose,
  item,
  vendorId,
}: {
  open: boolean;
  onClose: () => void;
  /** Null when adding a dish. */
  item: MenuItem | null;
  vendorId: number;
}) {
  const isEdit = item !== null;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateMenuItem : createMenuItem,
    EMPTY,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (state.success) closeRef.current();
  }, [state.success]);

  // Object URLs leak until revoked, so drop the old one whenever it changes.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!open) return null;

  const errors = state.fieldErrors ?? {};
  const submitted = state.values;
  const shownImage = preview ?? item?.image ?? null;

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSizeError(null);
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      // Caught here so a large upload fails instantly instead of after a
      // slow round trip that the server would reject anyway.
      setSizeError(`That image is over ${MAX_IMAGE_MB}MB. Pick a smaller one.`);
      event.target.value = "";
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  return (
    <DialogShell title={isEdit ? "Edit dish" : "Add dish"} onClose={onClose}>
      <form
        key={submitted ? "resubmit" : "initial"}
        action={formAction}
        className="space-y-5 px-stack-lg py-stack-md"
      >
        <input type="hidden" name="vendor" value={vendorId} />
        {isEdit && <input type="hidden" name="id" value={item.id} />}

        <FormError message={state.error} />

        <div>
          <span className="mb-2 block font-label-md text-label-md text-on-surface">Photo</span>
          <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-md border border-surface-container-highest bg-surface-container-low">
            {shownImage ? (
              <Image
                src={shownImage}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover"
                unoptimized={preview !== null}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                <span className="font-body-sm text-body-sm">No photo yet</span>
              </div>
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={onFileChange}
            className="w-full cursor-pointer rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 font-body-sm text-body-sm text-on-surface file:mr-3 file:rounded file:border-0 file:bg-surface-container-high file:px-3 file:py-1 file:font-label-md file:text-label-md file:text-on-surface hover:file:bg-surface-container-highest"
          />
          {sizeError ? (
            <p className="mt-1 font-body-sm text-body-sm text-error">{sizeError}</p>
          ) : errors.image ? (
            <p className="mt-1 font-body-sm text-body-sm text-error">{errors.image}</p>
          ) : state.imageNeedsReselect ? (
            <p className="mt-1 font-body-sm text-body-sm text-error">
              Pick the photo again — the browser clears file inputs after a failed save.
            </p>
          ) : (
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              {isEdit ? "Leave empty to keep the current photo." : "Optional. 16:9 works best."}
            </p>
          )}
        </div>

        <Field
          label="Dish name"
          name="dish_name"
          required
          defaultValue={submitted?.dish_name ?? item?.dish_name ?? ""}
          placeholder="Beef Pilau Special"
          error={errors.dish_name}
          hint="Must be unique for this vendor."
        />

        <Field
          label="Description"
          name="description"
          defaultValue={submitted?.description ?? item?.description ?? ""}
          placeholder="Slow-cooked with cardamom and cumin"
          error={errors.description}
        />

        <Field
          label="Price (KSh)"
          name="price"
          inputMode="decimal"
          required
          defaultValue={submitted?.price ?? item?.price ?? ""}
          placeholder="350"
          error={errors.price}
        />

        <Toggle
          name="is_available"
          label="Available"
          defaultChecked={submitted?.is_available ?? item?.is_available ?? true}
          description="Unavailable dishes stay on the menu here but are hidden from customers."
        />

        <DialogFooter
          onCancel={onClose}
          pending={pending}
          submitLabel={isEdit ? "Save changes" : "Add dish"}
        />
      </form>
    </DialogShell>
  );
}
