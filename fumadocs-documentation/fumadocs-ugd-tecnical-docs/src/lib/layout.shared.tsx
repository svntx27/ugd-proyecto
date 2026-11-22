import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { GraduationCap } from 'lucide-react';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <GraduationCap className="w-4 h-4 text-foreground/80" />
          <span className="font-bold tracking-tight">UGD</span>
          <span className="text-muted-foreground/40 font-light">/</span>
          <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
            Manual Técnico
          </span>
        </span>
      ),
    },
    links: [
      {
        text: 'Backend API',
        url: '/docs/backend',
        active: 'nested-url',
        on: 'nav',
      },
      {
        text: 'Frontend Admin',
        url: '/docs/frontend-admin',
        active: 'nested-url',
        on: 'nav',
      },
      {
        text: 'Frontend Usuarios',
        url: '/docs/frontend-user',
        active: 'nested-url',
        on: 'nav',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
