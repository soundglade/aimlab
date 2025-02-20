import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <p>
        Welcome to the admin panel. Use the navigation on the left to manage the
        site.
      </p>
    </AdminLayout>
  );
}
