import AdminLayout from "@/components/dashboard/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="mb-4 text-2xl">Admin Dashboard</h1>
      <p>
        Welcome to the admin panel. Use the navigation on the left to manage the
        site.
      </p>
    </AdminLayout>
  );
}
