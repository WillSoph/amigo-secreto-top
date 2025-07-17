"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import Image from "next/image";

type Props = {
  onLogout?: () => void;
};

export default function Header({ onLogout }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-white border-b shadow-sm relative">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft size={20} />
        </Button>
        <Image
          src="/amigo-secreto-top-logo.png"
          alt="Logo Amigo Secreto Top"
          width={120}
          height={36}
          className="drop-shadow-lg"
          priority
        />
      </div>

      {/* Menu Desktop */}
      <nav className="hidden sm:flex items-center space-x-4">
        <Button variant="link" onClick={() => router.push("/")}>
          Home
        </Button>
        <Button
          variant="outline"
          onClick={() => { setOpen(false); onLogout(); }}
        >
          Logout
        </Button>
        {/* Outros menus aqui */}
      </nav>

      {/* Mobile Sandwich Icon */}
      <button
        className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          {/* Sidebar */}
          <div className="ml-auto w-64 bg-white h-full shadow-lg flex flex-col p-6 relative animate-slide-in-right">
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X size={24} />
            </button>
            <nav className="flex flex-col space-y-4 mt-10">
              <Button variant="link" onClick={() => { setOpen(false); router.push("/"); }}>
                Home
              </Button>
              {/* Outros menus aqui */}
              {onLogout && (
                <Button
                  variant="outline"
                  onClick={() => { setOpen(false); onLogout(); }}
                >
                  Logout
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </header>
  );
}
