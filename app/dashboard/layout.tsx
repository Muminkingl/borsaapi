import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { RtlDirectionProvider } from '@/components/ui/direction-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RtlDirectionProvider>
      <SidebarProvider>
        <div className="flex min-h-screen relative w-full">
          <AdminSidebar />
          <main className="flex-1 overflow-auto flex flex-col bg-background">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </RtlDirectionProvider>
  );
}
