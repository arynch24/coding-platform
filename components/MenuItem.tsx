import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { MenuItem } from '@/types/dashboard';

interface DropdownMenuProps {
  items: MenuItem[];
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle menu
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Close menu
  const closeMenu = () => setIsOpen(false);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Position menu dynamically
  useEffect(() => {
    if (!isOpen || !buttonRef.current || !menuRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menu = menuRef.current;

    // Position using fixed + scroll offset
    menu.style.position = 'fixed';
    menu.style.left = `${buttonRect.right + window.scrollX - 192}px`; // w-48 = 192px
    menu.style.top = `${buttonRect.bottom + window.scrollY + 8}px`;
    menu.style.zIndex = '9999';
    menu.style.transform = 'opacity-0 scale(0.95)';
    menu.style.transition = 'transform 100ms ease';
    menu.setAttribute('data-state', 'open');

    // Force reflow
    menu.getBoundingClientRect();

    // Animate in
    menu.style.transform = 'opacity-1 scale(1)';

    // Check screen bounds
    const menuRect = menu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
      menu.style.left = `${buttonRect.left + window.scrollX - menuRect.width + buttonRect.width}px`;
    }
    if (menuRect.bottom > window.innerHeight) {
      menu.style.top = `${buttonRect.top + window.scrollY - menuRect.height - 8}px`;
    }
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.action();
      closeMenu();
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-200"
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>

      {/* Portal Rendered Menu */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
            role="menu"
            tabIndex={-1}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-150
                  ${item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  focus:outline-none focus:bg-gray-50
                `}
                role="menuitem"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default DropdownMenu;