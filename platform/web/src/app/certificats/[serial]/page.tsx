import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import { formatDate, type CertificateView } from "@/lib/courses";

export const metadata: Metadata = { title: "Vérification de certificat" };

/** Page publique : n'importe qui (recruteur, école…) peut vérifier un certificat à partir de son lien. */
export default async function CertificatePage({ params }: PageProps<"/certificats/[serial]">) {
  const certificate = await apiGet<CertificateView>(`/public/certificates/${(await params).serial}`);
  if (!certificate) notFound();
  const { payload } = certificate;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <Card className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Award className="size-10 text-primary" aria-hidden />
          <p className="text-sm tracking-widest text-muted-foreground uppercase">Certificat de réussite</p>
          <h1 className="text-3xl font-semibold tracking-tight">{payload.holder}</h1>
          <p className="text-muted-foreground">
            a terminé toutes les leçons et réussi tous les quiz du cours
          </p>
          <p className="text-xl font-medium text-balance">{payload.course}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(certificate.issuedAt)} · {payload.platform}
          </p>
          <p className="font-mono text-xs text-muted-foreground">n° {certificate.serial}</p>
        </CardContent>
      </Card>

      <section aria-labelledby="verification" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="verification" className="text-xl font-semibold">Vérification</h2>
          {certificate.valid ? (
            <Badge className="gap-1">
              <ShieldCheck aria-hidden /> Signature valide
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <ShieldAlert aria-hidden /> Signature invalide
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Le contenu ci-dessous est signé en {certificate.algorithm} par la plateforme (clé{" "}
          <code className="font-mono">{certificate.keyId}</code>). Toute modification, même d&apos;un caractère, rend la
          signature invalide.
        </p>

        <Field label="Contenu signé (JSON canonique, UTF-8)" value={certificate.canonicalPayload} />
        <Field label="Signature (Base64)" value={certificate.signatureBase64} />
        {certificate.publicKeyPem && <Field label="Clé publique de la plateforme" value={certificate.publicKeyPem} />}

        <details className="rounded-xl border p-4 text-sm">
          <summary className="cursor-pointer font-medium">Vérifier soi-même avec OpenSSL</summary>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-muted-foreground">
            <li>
              Enregistrez le contenu signé dans <code className="font-mono">certificat.json</code> (sans retour à la ligne final),
              la clé publique dans <code className="font-mono">cle.pem</code>, la signature dans{" "}
              <code className="font-mono">signature.b64</code>.
            </li>
            <li>
              <code className="font-mono">openssl base64 -d -A -in signature.b64 -out signature.bin</code>
            </li>
            <li>
              <code className="font-mono">
                openssl pkeyutl -verify -pubin -inkey cle.pem -rawin -in certificat.json -sigfile signature.bin
              </code>
            </li>
          </ol>
        </details>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs break-all whitespace-pre-wrap">{value}</pre>
    </div>
  );
}
