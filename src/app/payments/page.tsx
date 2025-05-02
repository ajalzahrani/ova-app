// page.tsx (server component) is where we'll fetch data and render our table.

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <DashboardShell>
      <DashboardHeader heading="Payments" text="Manage and track payments" />
      <div className="container mx-auto">
        <DataTable columns={columns} data={data} />
      </div>
    </DashboardShell>
  );
}
