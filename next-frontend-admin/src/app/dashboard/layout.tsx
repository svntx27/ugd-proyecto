import { cookies } from "next/headers";
import { Sidebar } from "@/components/Sidebar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const initialRole = cookieStore.get("admin_role")?.value || "";

    return (
        <div className="min-h-screen bg-background text-foreground antialiased flex">
            <Sidebar initialRole={initialRole} />
            <DashboardShell>
                {children}
            </DashboardShell>
        </div>
    );
}
