'use client';

import { memo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Key,
  FolderOpen,
  Settings,
  Moon,
  Sun,
  LogOut,
  User,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// We will map over a function or within component to get translations
const getMenuItems = (t: any) => [
  { title: t.sidebar.dashboard, icon: LayoutDashboard, href: '/dashboard' },
  { title: t.sidebar.apiKeys, icon: Key, href: '/dashboard/api-keys' },
  { title: t.sidebar.projectListing, icon: FolderOpen, href: '/dashboard/projects' },
];

import { useTranslation } from '@/hooks/useTranslation';

export const AdminSidebar = memo(() => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);

  // Avoid hydration mismatch — theme is only known after mount on client
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name || data.user.email || 'User',
          avatarUrl: data.user.user_metadata?.avatar_url || null,
        });
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link prefetch={false} href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden shrink-0">
                  <img src="/logo.png" alt="BorsaAPI Logo" className="w-full h-full object-cover" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">BorsaAPI</span>
                  <span className="truncate text-xs">{t.sidebar.devPortal}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.sidebar.navigation}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems(t).map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link prefetch={false} href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Theme Toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              tooltip={!mounted ? '' : theme === 'dark' ? t.sidebar.lightMode : t.sidebar.darkMode}
            >
              {/* Defer icon until mounted to prevent hydration mismatch */}
              {mounted && (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
              <span>{!mounted ? t.sidebar.darkMode : theme === 'dark' ? t.sidebar.lightMode : t.sidebar.darkMode}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User Profile with Sign Out */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold overflow-hidden shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name ?? 'Loading...'}</span>
                    <span className="truncate text-xs text-muted-foreground">{t.sidebar.freePlan}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="me-2 h-4 w-4" />
                  {t.sidebar.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
