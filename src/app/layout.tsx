import './globals.css'
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "Amigo Secreto Top - Sorteio Online Fácil, Rápido e Divertido",
  description: "Organize seu amigo secreto online de forma fácil, rápida e divertida! Compartilhe o link com seus amigos, personalize seu grupo e faça o sorteio automático. Grátis, seguro e sem cadastro.",
  keywords: "amigo secreto, amigo secreto online, amigo oculto, sorteio amigo secreto, sorteio online, grupo amigo secreto, sorteio amigo oculto online, sorteio fácil, sorteio rápido, natal, presente, brincadeira, organizador amigo secreto, secret santa, gift exchange",
  openGraph: {
    title: "Amigo Secreto Top - Sorteio Online Fácil",
    description: "Crie seu grupo de amigo secreto online, compartilhe o link e faça o sorteio automático. Simples, seguro e divertido!",
    url: "https://amigosecretotop.com",
    siteName: "Amigo Secreto Top",
    images: [
      {
        url: "https://amigosecretotop.com/logo-og.png",
        width: 1200,
        height: 630,
        alt: "Amigo Secreto Top Logo",
      }
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amigo Secreto Top",
    description: "Organize seu amigo secreto online com praticidade e diversão. Grátis e sem cadastro!",
    images: ["https://amigosecretotop.com/logo-og.png"],
  }
}

export default function RootLayout({ children }) {
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
