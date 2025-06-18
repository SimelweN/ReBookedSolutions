import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Index from "./pages/Index";
import BookListing from "./pages/BookListing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import "./App.css";

function App() {
  return (
    <div
      style={{ backgroundColor: "#f9fafb", minHeight: "100vh", color: "#000" }}
    >
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/books" element={<BookListing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
