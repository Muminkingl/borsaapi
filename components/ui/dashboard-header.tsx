'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Bell, Search, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-background/95 sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="me-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">BorsaAPI</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ms-auto flex items-center gap-2 px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="text-muted-foreground absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t.dashboard.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-56 ps-10"
            />
          </div>

          {/* Refresh */}
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
}

DashboardHeader.displayName = 'DashboardHeader';
