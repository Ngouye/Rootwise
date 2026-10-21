export const siteConfig = {
  name: "Rootwise",
  tagline: "Cybersécurité · Linux",
  description:
    "Cryptographie, administration Linux et réseau : des cours clairs et pratiques, des quiz pour valider vos acquis et un certificat signé que tout le monde peut vérifier.",
  nav: [
    { href: "/cours", label: "Cours", step: 4, ready: true, summary: "Cours texte, vidéo et PDF par niveau, quiz de chapitre et certificats signés." },
    { href: "/labo", label: "Labo", step: 7, ready: false, summary: "AES, RSA, hachage et signatures directement dans le navigateur." },
    { href: "/forum", label: "Forum", step: 6, ready: false, summary: "Questions, réponses, votes et réponse acceptée." },
    { href: "/chat", label: "Chat", step: 5, ready: false, summary: "Salons thématiques et messages privés en temps réel." },
    { href: "/blog", label: "Blog", step: 8, ready: false, summary: "Articles de la communauté et veille cybersécurité (RSS)." },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
