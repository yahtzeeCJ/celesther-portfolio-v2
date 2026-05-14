
"use client";

import Link from 'next/link';
import { Linkedin, Github, ArrowUp } from 'lucide-react';
import { DiscordIcon } from '@/components/icons/discord-icon';
import EditableTextInline from '@/components/editable-text-inline';
import { useAdmin } from '@/contexts/AdminContext';
import type { SiteContent } from '@/types/content';


const staticSocialLinksData = [
  { href: 'https://www.linkedin.com/in/celesther-john-lutche-788994369', icon: <Linkedin className="h-5 w-5" />, ariaLabelKey: 'footerSocialLinkedinAriaLabel' as keyof SiteContent },
  { href: 'https://github.com/yahtzeeCJ', icon: <Github className="h-5 w-5" />, ariaLabelKey: 'footerSocialGithubAriaLabel' as keyof SiteContent },
  { href: 'https://discord.com/users/858980553221734400', icon: <DiscordIcon className="h-5 w-5" />, ariaLabelKey: 'footerSocialDiscordAriaLabel' as keyof SiteContent },
];

export default function Footer() {
  const { siteContent } = useAdmin();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <Link href="#home" className="text-2xl font-bold text-primary">
              <EditableTextInline contentKey="footerLogoTextLine1" as="span">
                {siteContent.footerLogoTextLine1}
              </EditableTextInline>
              <span className="text-foreground">
                <EditableTextInline contentKey="footerLogoTextLine2" as="span">
                  {siteContent.footerLogoTextLine2}
                </EditableTextInline>
              </span>
            </Link>
            <p className="text-muted-foreground mt-2 max-w-md">
              <EditableTextInline contentKey="footerTagline" as="span" inputClassName="text-muted-foreground">
                {siteContent.footerTagline}
              </EditableTextInline>
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-6">
              {staticSocialLinksData.map((link) => (
                <a
                  key={siteContent[link.ariaLabelKey] as string || link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={siteContent[link.ariaLabelKey] as string}
                  className="text-muted-foreground hover:text-primary transition p-2 rounded-full hover:bg-primary/10"
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <Link href="#home" className="flex items-center text-muted-foreground hover:text-foreground transition">
              <ArrowUp className="h-4 w-4 mr-2" />
              <EditableTextInline contentKey="footerBackToTopText" as="span">
                {siteContent.footerBackToTopText}
              </EditableTextInline>
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground">
          <p>
            &copy; {currentYear}
            <EditableTextInline contentKey="footerCopyrightTextPart1" as="span" inputClassName="text-muted-foreground">
              {siteContent.footerCopyrightTextPart1}
            </EditableTextInline>
            {' '}
            <EditableTextInline contentKey="footerCopyrightTextPart2" as="span" inputClassName="text-muted-foreground">
              {siteContent.footerCopyrightTextPart2}
            </EditableTextInline>
          </p>
        </div>
      </div>
    </footer>
  );
}

