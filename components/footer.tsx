// components/footer.tsx
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="mt-10 bg-black text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top: brand + short description */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">ServiceHub</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Discover and book trusted local services in Bengaluru – from home cleaning to repairs, all in one place.
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Follow us</span>
            <a
              href="#"
              className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-700 hover:border-blue-500 hover:text-blue-400 transition"
            >
              <FaFacebookF className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-700 hover:border-pink-500 hover:text-pink-400 transition"
            >
              <FaInstagram className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-700 hover:border-sky-500 hover:text-sky-400 transition"
            >
              <FaTwitter className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-700 hover:border-blue-600 hover:text-blue-500 transition"
            >
              <FaLinkedinIn className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Middle: links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-800 pt-6 text-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Company
            </p>
            <a href="/about" className="block hover:text-white">
              About us
            </a>
            <a href="/contact" className="block hover:text-white">
              Contact
            </a>
            <a href="/careers" className="block hover:text-white">
              Careers
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Support
            </p>
            <a href="/help" className="block hover:text-white">
              Help Center
            </a>
            <a href="/privacy" className="block hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="block hover:text-white">
              Terms of Service
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Contact
            </p>
            <p className="text-xs text-gray-400">
              Bengaluru, Karnataka, India
            </p>
            <a
              href="mailto:support@example.com"
              className="block text-xs hover:text-white"
            >
              support@example.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-800 pt-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ServiceHub. All rights reserved.</p>
          <p>Made with love in Bengaluru.</p>
        </div>
      </div>
    </footer>
  );
}
