import { Link } from "react-router-dom";
import Logo from "../../../common/Logo";

const Footer = () => {
  return (
    <footer className="bg-charcoal-grey text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="small" />
              <h3 className="text-2xl font-bold">MomoSewa</h3>
            </div>
            <p className="text-white/70 mb-4 max-w-md">
              Your one-stop platform for authentic Nepali momo. Order, customize, and enjoy fresh momo delivered to your door.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <span>+977-9860579795</span>
              <span>•</span>
              <span>Lokanthali, Kathmandu</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="text-white/70 hover:text-golden-amber transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-golden-amber transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-golden-amber transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h4 className="font-bold text-lg mb-4">For Vendors</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/signup/vendor" className="text-white/70 hover:text-golden-amber transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-golden-amber transition-colors">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} MomoSewa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


