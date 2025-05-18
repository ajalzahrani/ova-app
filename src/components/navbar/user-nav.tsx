"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { getOccurrenceByNo } from "@/actions/occurrences";
import { useToast } from "@/components/ui/use-toast";
import { useOccurrenceSearchStore } from "@/stores/occurrenceStore";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

export function UserNav() {
  const { data: session } = useSession();

  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    // clear the occurrence search store
    useOccurrenceSearchStore.getState().resetSearchParams();
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (!session?.user) {
    return null;
  }

  const handleSearch = async (formData: FormData) => {
    // TODO: Handle press enter key
    const search = formData.get("search");
    console.log({ search });
    if (search) {
      const occurrence = await getOccurrenceByNo(search as string);
      if (occurrence) {
        router.push(`/occurrences/${occurrence.id}`);
      } else {
        toast({
          title: "Occurrence not found",
          description: "Please check the occurrence number and try again.",
        });
      }
    } else {
      router.push(`/occurrences`);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <form action={handleSearch}>
        <Input
          type="search"
          name="search"
          placeholder="Search occurrences no..."
          className="w-64"
        />
      </form>
      <NotificationDropdown />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                // src={session.user.image || "/placeholder.svg?height=32&width=32"}
                alt={session.user.name || "@user"}
              />
              <AvatarFallback>
                {session.user.name ? getInitials(session.user.name) : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/notifications")}>
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
