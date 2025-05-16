"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2 } from "lucide-react";
import { Prisma } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { deleteIncident } from "@/actions/incidents";
import { IncidentFormDialog } from "./incident-form-dialog";

export type IncidentWithRelations = Prisma.IncidentGetPayload<{
  include: {
    children: true;
    severity: true;
    parent: true;
  };
}>;

interface IncidentListProps {
  incidents: IncidentWithRelations[];
}

export function IncidentList({ incidents }: IncidentListProps) {
  const [incidentToEdit, setIncidentToEdit] =
    useState<IncidentWithRelations | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [incidentToDelete, setIncidentToDelete] =
    useState<IncidentWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteIncident = async () => {
    if (!incidentToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteIncident(incidentToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: `Incident '${incidentToDelete.name}' has been deleted`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete incident",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the role",
      });
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIncidentToDelete(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Card>
        <CardHeader>
          <CardTitle>Incident Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.name}</TableCell>
                    <TableCell>{incident.parent?.name || "~~~~~"}</TableCell>
                    <TableCell>{incident.severity?.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIncidentToEdit(incident);
                          setIsEditing(true);
                        }}>
                        <FileEdit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIncidentToDelete(incident)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No incidents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog - conditionally render with proper open state management */}
      {isEditing && (
        <IncidentFormDialog
          incidentId={incidentToEdit?.id}
          incidents={incidents}
          open={isEditing}
          onOpenChange={(open) => {
            setIsEditing(open);
            if (!open) setIncidentToEdit(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!incidentToDelete}
        onOpenChange={(open) => !open && setIncidentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the incident &quot;
              {incidentToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIncidentToDelete(null)}
              disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteIncident}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
