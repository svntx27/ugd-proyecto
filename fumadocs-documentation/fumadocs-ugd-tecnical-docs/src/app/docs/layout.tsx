import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { Server, LayoutDashboard, Users } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      links={[]}
      tabs={{
        transform(option, node) {
          if (option.url.startsWith('/docs/backend')) {
            return {
              ...option,
              title: 'Backend API',
              description: 'Servicios REST, Prisma ORM y SSE',
              icon: <Server className="size-full text-foreground/80" />,
            };
          }
          if (option.url.startsWith('/docs/frontend-admin')) {
            return {
              ...option,
              title: 'Frontend Admin',
              description: 'Monitor en vivo y gestión de citas',
              icon: <LayoutDashboard className="size-full text-foreground/80" />,
            };
          }
          if (option.url.startsWith('/docs/frontend-user')) {
            return {
              ...option,
              title: 'Frontend Usuarios',
              description: 'Autoservicio y agenda de citas',
              icon: <Users className="size-full text-foreground/80" />,
            };
          }
          return option;
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
