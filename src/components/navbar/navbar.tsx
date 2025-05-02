import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldAlert } from "lucide-react";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user) {
    return (
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-screen-xl flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6" />
            <h1 className="text-xl font-bold">OVA System</h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between py-4 px-4">
        <MainNav />
        <div className="space-x-3">
          <UserNav />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
