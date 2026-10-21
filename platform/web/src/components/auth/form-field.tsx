import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = ComponentProps<"input"> & {
  name: string;
  label: string;
  error?: string;
  hint?: string;
};

/** Libellé + champ + message (aide ou erreur), reliés pour les lecteurs d'écran. */
export function FormField({ name, label, error, hint, ...inputProps }: FormFieldProps) {
  const id = `field-${name}`;
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...inputProps}
      />
      {message && (
        <p id={messageId} className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {message}
        </p>
      )}
    </div>
  );
}
