import { Sidebar } from "@/components/admin/Sidebar";
import { getUserOrThrow } from "@/lib/api/auth";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/utils/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getUserOrThrow();
    if (!isAdminEmail(user.email)) {
      redirect("/auth/login?error=admin_only");
    }
  } catch (error) {
    redirect("/auth/login?redirect=/ppadminpp");
  }

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}


