import type { ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FormAlertProps = {
  tone?: "error" | "success";
  children: ReactNode;
};

export function FormAlert({ tone = "error", children }: FormAlertProps) {
  return (
    <Alert variant={tone === "error" ? "destructive" : "default"}>
      {tone === "error" ? <CircleAlert aria-hidden /> : <CircleCheck aria-hidden className="text-primary" />}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
