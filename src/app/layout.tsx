import './globals.css'
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "Amigo Secreto Online Sem Cadastro | Sorteio Grátis – Amigo Secreto Top",
  icons: {
    icon: "/favicon.png",
  },
  description: "Crie seu amigo secreto online grátis e sem cadastro. Compartilhe o link do grupo, personalize e faça o sorteio automático com total segurança.",
  keywords: "amigo secreto online, sorteio amigo secreto, amigo oculto virtual, organizar amigo secreto, grupo de amigo secreto, sorteio natalino, secret santa, brincadeira de amigo oculto online, sem cadastro",
  openGraph: {
    title: "Crie Amigo Secreto Online Grátis – Sem Cadastro | Amigo Secreto Top",
    description: "Sorteie amigo secreto online sem precisar de cadastro. Crie o grupo, compartilhe o link e divirta-se. Ideal para empresas, famílias e amigos!",
    url: "https://amigosecretotop.com.br",
    siteName: "Amigo Secreto Top",
    images: [
      {
        url: "https://amigosecretotop.com/logo-og.png",
        width: 1200,
        height: 630,
        alt: "Logo da plataforma de sorteio de amigo secreto online Amigo Secreto Top",
      }
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amigo Secreto Online Grátis – Sorteio Rápido e Sem Cadastro",
    description: "Crie e sorteie amigo secreto com seu grupo em segundos, direto do navegador. Não precisa de e-mail nem login!",
    images: ["https://amigosecretotop.com/logo-og.png"],
  }
}

import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
      </head>
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
