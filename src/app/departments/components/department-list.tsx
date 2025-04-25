"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileEdit,
  Eye,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  AlertOctagon,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";

type DepartmentWithRelations = Prisma.DepartmentGetPayload<{}>;

interface DepartmentListProps {
  departments: DepartmentWithRelations[];
}

export function DepartmentList({ departments }: DepartmentListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {/* <TableHead>Members</TableHead> */}
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell>{department.name}</TableCell>
              {/* <TableCell>{department.members.length}</TableCell> */}
              <TableCell>{"N/A"}</TableCell>
              <TableCell>{"N/A"}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <Link href={`/departments/${department.id}/edit`}>
                    <FileEdit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon">
                  <Link href={`/departments/${department.id}/delete`}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
