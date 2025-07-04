import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import ConnectionStatus from "./ConnectionStatus";
import QAQuickAccess from "./QAQuickAccess";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 mobile-container">
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="w-full max-w-full">{children}</div>
      </main>
      <Footer />
      <ConnectionStatus />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "mobile-toast",
          duration: 4000,
        }}
      />
      {/* Only show QA dashboard in development or for admins */}
      {import.meta.env.DEV && <QAQuickAccess />}
    </div>
  );
};

export default Layout;
