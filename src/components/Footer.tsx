
import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center" onClick={handleLinkClick}>
              <Book className="h-6 w-6 text-book-600" />
              <span className="ml-2 text-xl font-bold text-book-800">ReBooked Solutions</span>
            </Link>
            <p className="text-gray-600 text-sm">
              Buy and sell new and used books through our secure platform. No direct communication needed.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/books" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Browse Books
                </Link>
              </li>
              <li>
                <Link to="/books?category=textbooks" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Textbooks
                </Link>
              </li>
              <li>
                <Link to="/books?condition=used" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Used Books
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Sell a Book
                </Link>
              </li>
              <li>
                <Link to="/activity" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  My Activity
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-book-600 text-sm" onClick={handleLinkClick}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} ReBooked Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
