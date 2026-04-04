import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/ui/admin-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen relative w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-auto flex flex-col bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
