import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface CampusLayoutProps {
  children: ReactNode;
}

const CampusLayout = ({ children }: CampusLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path === "/university-info" && location.pathname === "/university-info")
      return true;
    if (path === "/resources" && location.pathname === "/resources")
      return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavigation("/")}
                className="flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-green-700 rounded-xl cursor-pointer">
                  <span className="text-white text-lg font-bold leading-7">
                    R
                  </span>
                </div>
                <span className="text-green-700 text-xl font-bold leading-7 ml-2">
                  ReBooked Solutions
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-baseline ml-10 space-x-4">
                <button
                  onClick={() => handleNavigation("/")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive("/")
                      ? "text-green-700 bg-green-50"
                      : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigation("/university-info")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive("/university-info")
                      ? "text-green-700 bg-green-50"
                      : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  University Info
                </button>
                <button
                  onClick={() => handleNavigation("/books")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive("/books")
                      ? "text-green-700 bg-green-50"
                      : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  Browse Books
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t pb-4 pt-2">
            <div className="flex flex-col space-y-2 px-6">
              <button
                onClick={() => handleNavigation("/")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                  isActive("/")
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("/university-info")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                  isActive("/university-info")
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                University Info
              </button>
              <button
                onClick={() => handleNavigation("/books")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                  isActive("/books")
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                Browse Books
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default CampusLayout;
