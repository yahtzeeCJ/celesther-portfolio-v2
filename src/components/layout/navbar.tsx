
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, X, LogOut, Save, UserCog, Settings, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import GlobalSettingsModal from '@/components/admin/global-settings-modal';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, logout, saveChanges, recoverFromLocalStorage, undo, redo, canUndo, canRedo } = useAdmin();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You are no longer in admin mode." });
  };

  const handleSaveChanges = async () => {
    await saveChanges();
  };

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-card bg-opacity-80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="#home" className="text-2xl font-bold text-primary">
          Celesther John<span className="text-foreground"> Lutche</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground hover:text-primary transition px-2 py-1 rounded-md"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSaveChanges} title="Save Changes">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => recoverFromLocalStorage()} title="Restore Local Data">
                <Save className="h-4 w-4 rotate-180" /> {/* Flip safe icon for restore */}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} title="Logout Admin">
                <LogOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Global Settings" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/admin">
              <Button variant="ghost" size="icon" title="Admin Login">
                <UserCog className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle Theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="mr-2" title="Toggle Theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {isAdmin && (
            <>
              <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} className="mr-1" title="Undo (Ctrl+Z)">
                <Undo2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} className="mr-4" title="Redo (Ctrl+Y)">
                <Redo2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSaveChanges} className="mr-2" title="Save Changes">
                <Save className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="mr-2" title="Logout Admin">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
          {!isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="mr-2" title="Admin Login">
                <UserCog className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-card p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 flex justify-between items-center border-b border-border">
                  <Link href="#home" className="text-lg font-bold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Celesther J.<span className="text-foreground"> Lutche</span>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon"><X /></Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col space-y-4 p-4">
                  {navLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="text-foreground hover:text-primary transition text-lg py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
      {isAdmin && <GlobalSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
    </>
  );
}
