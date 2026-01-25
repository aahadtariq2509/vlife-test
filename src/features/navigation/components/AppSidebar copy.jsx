'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronRight, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sidebarMenu } from '@/data';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function AppSidebar({ className = '', isOpen = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [openMenus, setOpenMenus] = useState(new Set());

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      // Even if logout fails, redirect to login
      router.push('/login');
    }
  };

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'w-56 bg-white border-r border-gray-200 h-full overflow-y-auto transition-transform duration-300 ease-in-out',
        // Mobile: slide in from left when open
        'fixed lg:relative z-50 lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        className
      )}>
        {/* Logo Section */}
        <div className="flex items-center justify-between py-4 px-4">
          <Image
            src="/images/logos/logo.png"
            alt="VLW Logo"
            width={64}
            height={64}
            className="w-16 h-16"
          />
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {sidebarMenu.menuItems.map((item) => {
              const isActive = pathname === `/${item.category}` || pathname.startsWith(`/${item.category}/`);
              const isMenuOpen = openMenus.has(item.id);

              return (
                <li key={item.id}>
                  <div className={cn(
                    'flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}>
                    <Link
                      href={`/${item.category}`}
                      className="flex items-center flex-1"
                    >
                      <div className="flex items-center">
                        {/* Main menu icons from API data - no filter applied */}
                        <Image
                          src={item.image_url}
                          alt={`${item.name} icon`}
                          width={16}
                          height={16}
                          className="mr-2.5 flex-shrink-0"
                        />
                        <span className="text-[13px]">{item.name}</span>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleMenu(item.id);
                      }}
                      className={cn(
                        'p-1 rounded-md transition-colors',
                        isActive
                          ? 'hover:bg-blue-100'
                          : 'hover:bg-gray-100'
                      )}
                    >
                      {isMenuOpen ? (
                        <ChevronDown className={cn(
                          'w-3.5 h-3.5',
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        )} />
                      ) : (
                        <ChevronRight className={cn(
                          'w-3.5 h-3.5',
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        )} />
                      )}
                    </button>
                  </div>

                  {/* Settings Submenu - only show if menu is open */}
                  {isMenuOpen && (
                    <div>
                      <ul className="ml-5 mt-1 space-y-0.5">
                        <li>
                          <Link
                            href={`/${item.category}/settings`}
                            className={cn(
                              'flex items-center px-3 py-2 text-[13px] font-medium transition-colors',
                              pathname === `/${item.category}/settings`
                                ? 'text-blue-700'
                                : 'text-gray-500 hover:text-gray-700'
                            )}
                          >
                            <Image
                              src="/images/icons/settings.png"
                              alt="Settings icon"
                              width={14}
                              height={14}
                              className="mr-2.5 flex-shrink-0"
                              style={{
                                filter: pathname === `/${item.category}/settings`
                                  ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
                                  : 'brightness(0) saturate(100%) invert(30%) sepia(8%) saturate(1033%) hue-rotate(202deg) brightness(96%) contrast(86%)'
                              }}
                            />
                            Settings
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={`/${item.category}/widgets`}
                            className={cn(
                              'flex items-center px-3 py-2 text-[13px] font-medium transition-colors',
                              pathname === `/${item.category}/settings`
                                ? 'text-blue-700'
                                : 'text-gray-500 hover:text-gray-700'
                            )}
                          >
                            <Image
                              src="/images/icons/settings.png"
                              alt="Settings icon"
                              width={14}
                              height={14}
                              className="mr-2.5 flex-shrink-0"
                              style={{
                                filter: pathname === `/${item.category}/settings`
                                  ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
                                  : 'brightness(0) saturate(100%) invert(30%) sepia(8%) saturate(1033%) hue-rotate(202deg) brightness(96%) contrast(86%)'
                              }}
                            />
                            Widgets
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 mr-2.5" />
              <span className="text-[13px]">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
