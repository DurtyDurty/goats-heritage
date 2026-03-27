import AdminMobileLayout from "@/components/admin/AdminMobileLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminMobileLayout>{children}</AdminMobileLayout>;
}
