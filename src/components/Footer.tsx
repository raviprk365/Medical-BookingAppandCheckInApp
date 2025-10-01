'use client';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Sydney Med</h3>
            <p className="text-gray-400 text-sm">
              Your trusted platform for booking medical appointments with verified healthcare providers.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/search" className="hover:text-white transition-colors">Find Doctors</a></li>
              <li><a href="/booking" className="hover:text-white transition-colors">Book Appointment</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">My Dashboard</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📞 1800-SYDNEY-MED</p>
              <p>✉️ help@sydneymed.com.au</p>
              <p>📍 Sydney, Australia</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Sydney Med Australia. All rights reserved. | Privacy compliant with Australian Privacy Act</p>
        </div>
      </div>
    </footer>
  );
};
