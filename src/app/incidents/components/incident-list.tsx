"use client";

import { SelectTrigger } from "@/components/ui/select";
import { File } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Incident, Prisma, Severity } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  addIncident,
  deleteIncident,
  editIncident,
  getAllIncidents,
  getAllSeverities,
} from "@/actions/incidents";
import { Form } from "@/components/ui/form";
import { IncidentFormValues } from "@/actions/incidents.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { incidentSchema } from "@/actions/incidents.validation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchInput, { SearchInputRef } from "@/components/ui/search-input";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type IncidentWithRelations = Prisma.IncidentGetPayload<{
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [incidentToDelete, setIncidentToDelete] =
    useState<IncidentWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedParentIncident, setSelectedParentIncident] =
    useState<Incident | null>(null);
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [parentIncidents, setParentIncidents] = useState<Incident[]>([]);

  const parentIncidentSearchInputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    const fetchParentIncidents = async () => {
      const result = await getAllIncidents();
      if (result.success) {
        setParentIncidents(result.incidents || []);
      }
    };
    const fetchSeverity = async () => {
      const result = await getAllSeverities();
      if (result.success) {
        setSeverities(result.severities || []);
      }
    };
    fetchParentIncidents();
    fetchSeverity();
  }, []);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      name: "",
      severityId: "",
      parentId: undefined,
    },
  });

  const handleEditIncident = async () => {
    if (!incidentToEdit) return;

    setIsEditing(true);
    try {
      const result = await editIncident(incidentToEdit);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while editing the incident",
      });
    }
  };

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

  const handleParentIncidentChange = (incident: Incident) => {
    setSelectedParentIncident(incident);
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
                        onClick={() => setIncidentToEdit(incident)}>
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
                  <TableCell colSpan={2} className="h-24 text-center">
                    No departments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit incident Dialog */}
      <Dialog
        open={!!isEditing}
        onOpenChange={(open) => !open && setIncidentToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Incident</DialogTitle>
            <DialogDescription>Edit the incident</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditIncident)}
              className="space-y-4">
              <CardContent>
                <div className="grid gap-4 py-4">
                  {/* Add incident name */}
                  <div className="grid gap-2">
                    <Label>Incident Name</Label>
                    <Input {...form.register("name")} />
                  </div>

                  {/* Add parent incident */}
                  <div className="space-y-2">
                    <Label htmlFor="parentIncident">Parent Incident</Label>
                    <SearchInput
                      {...form.register("parentId")}
                      ref={parentIncidentSearchInputRef}
                      options={parentIncidents}
                      onSelect={handleParentIncidentChange}
                      renderOption={(incident) => <span>{incident.name}</span>}
                      filterOption={(incident, searchTerm) =>
                        incident.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      }
                      getOptionLabel={(incident) => incident.name}
                      icon={<File className="w-4 h-4" />}
                    />
                  </div>

                  {/* Add severity */}
                  <div className="grid gap-2">
                    <Label>Severity</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("severityId", value)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {severities.map((severity) => (
                          <SelectItem key={severity.id} value={severity.id}>
                            {severity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Editing..." : "Edit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
