import type { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard - Unidad de Gestión de Doctorados (UGD)",
  description: "Administración de citas presenciales UGD - Universidad Central del Ecuador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-background text-foreground selection:bg-accent selection:text-accent-foreground min-h-screen">
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors theme="light" />
        </QueryProvider>
      </body>
    </html>
  );
}
