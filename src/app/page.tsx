import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, LogIn, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6" />
            <h1 className="text-xl font-bold">OVA System</h1>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Occupational Violence and Aggression Reporting System
            </h1>
            <p className="text-xl text-muted-foreground">
              Report incidents safely and efficiently
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8 py-8">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Anonymous Reporting</CardTitle>
                <CardDescription>
                  Report an incident without providing your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Use our anonymous reporting system to safely document
                  incidents of violence or aggression without fear of
                  repercussion.
                </p>
                <Link href="/anonymous-report">
                  <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Report Anonymously
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registered User Access</CardTitle>
                <CardDescription>
                  Sign in to access additional features and track your reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Sign in to your account to report incidents, track existing
                  reports, and access the full features of the OVA system.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About the OVA System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Occupational Violence and Aggression (OVA) System is
                designed to help organizations track, manage, and prevent
                incidents of workplace violence and aggression. Our platform
                ensures all incidents are properly documented, investigated, and
                addressed to maintain a safe working environment.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="font-medium">Easy Reporting</h3>
                  <p className="text-sm text-muted-foreground">
                    Simple forms to quickly document incidents
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Comprehensive Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor incident status and resolution
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Secure & Confidential</h3>
                  <p className="text-sm text-muted-foreground">
                    Optional anonymous reporting for sensitive situations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OVA System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
