import { Link } from "react-router-dom";
import { FaRegBell } from "react-icons/fa";
import { useState } from "react";

function Navbar() {
  // isOpen controls the notifications dropdown
  const [isOpen, setIsOpen] = useState(false);
  // mobileOpen controls the mobile nav menu
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-md shadow-black/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: brand + mobile toggler */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMobile}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {mobileOpen ? (
                // Close icon
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              ) : (
                // Hamburger icon
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <Link to="/" className="text-lg font-semibold">
              Job Portal 
            </Link>
          </div>

          {/* Center: desktop navigation */}
          <nav className="hidden md:flex items-center gap-12">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <a href="#about" className="hover:text-green-600">about</a>
            <Link to="/Cvscan" className="hover:text-green-600">Cv Scan</Link>
            <a href="#contact" className="hover:text-green-600">Contact</a>
          </nav>

          {/* Right: actions */}
          <div className="relative flex items-center gap-2">
            <Link
              to="/form"
              className="inline-flex items-center rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Register
            </Link>
            <button
              type="button"
              onClick={toggleOpen}
              aria-label="Notifications"
              aria-expanded={isOpen}
              className="rounded p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FaRegBell className="text-2xl" />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50">
                <div className="p-4 text-sm text-gray-600">No new notifications</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="space-y-1 px-4 py-3">
            <a onClick={() => setMobileOpen(false)} to="/" className="block rounded-md px-2 py-2 hover:bg-gray-100">Home</a>
            <a onClick={() => setMobileOpen(false)} href="#about" className="block rounded-md px-2 py-2 hover:bg-gray-100">About</a>
            <Link onClick={() => setMobileOpen(false)} to="/Cvscan" className="block rounded-md px-2 py-2 hover:bg-gray-100">Cv Scan</Link>
            <a onClick={() => setMobileOpen(false)} href="#contact" className="block rounded-md px-2 py-2 hover:bg-gray-100">Contact</a>
            <Link
              onClick={() => setMobileOpen(false)}
              to="/form"
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Register
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
