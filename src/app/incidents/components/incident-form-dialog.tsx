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
import { Badge, Eye, FileEdit, PlusCircle, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Incident, Prisma, Severity } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  addIncident,
  editIncident,
  getAllIncidents,
  getAllSeverities,
  getIncidentById,
} from "@/actions/incidents";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import SearchInput, { SearchInputRef } from "@/components/ui/search-input";
import { File } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  incidentSchema,
  type IncidentFormValues,
} from "@/actions/incidents.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { IncidentWithRelations } from "./incident-list";

interface IncidentFormDialogProps {
  incidentId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  incidents: IncidentWithRelations[];
}

export function IncidentFormDialog({
  incidentId,
  open: controlledOpen,
  onOpenChange,
  incidents,
}: IncidentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [selectedParentIncident, setSelectedParentIncident] =
    useState<IncidentWithRelations | null>(null);
  const [selectedSeverityId, setSelectedSeverityId] = useState<string>("");

  const parentIncidentSearchInputRef = useRef<SearchInputRef>(null);

  // Handle controlled vs uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  const handleParentIncidentChange = (
    incident: IncidentWithRelations | null
  ) => {
    setSelectedParentIncident(incident);
    if (incident) {
      form.setValue("parentId", incident.id);
    } else {
      form.setValue("parentId", undefined);
    }
  };

  // Form setup should be before any useEffect that uses it
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      id: "",
      name: "",
      severityId: "",
      parentId: undefined,
    },
  });

  useEffect(() => {
    if (incidentId) {
      const fetchIncident = async () => {
        const result = await getIncidentById(incidentId);
        if (result.success && result.incident) {
          form.setValue("name", result.incident.name || "");
          form.setValue("severityId", result.incident.severityId || "");
          setSelectedSeverityId(result.incident.severityId || "");
          form.setValue("parentId", result.incident.parentId || undefined);

          // If there's a parent, find it in the incidents and set it as selected
          if (result.incident.parentId && incidents.length > 0) {
            const parent = incidents.find(
              (p) => p.id === result.incident?.parentId
            );
            if (parent) {
              setSelectedParentIncident(parent);
              // Also update the search input display text
              if (parentIncidentSearchInputRef.current) {
                parentIncidentSearchInputRef.current.setSearchTerm(parent.name);
              }
            }
          }
        }
      };
      fetchIncident();
    } else {
      // Reset form for new incident
      form.reset({
        id: "",
        name: "",
        severityId: "",
        parentId: undefined,
      });
      setSelectedSeverityId("");
      setSelectedParentIncident(null);
      if (parentIncidentSearchInputRef.current) {
        parentIncidentSearchInputRef.current.reset();
      }
    }
  }, [incidentId, form, incidents]);

  useEffect(() => {
    const fetchSeverity = async () => {
      const result = await getAllSeverities();
      if (result.success) {
        setSeverities(result.severities || []);
      }
    };
    fetchSeverity();
  }, []);

  // Set the incidentId in the form
  useEffect(() => {
    if (incidentId) {
      form.setValue("id", incidentId);
    }
  }, [incidentId, form]);

  const handleAddIncident = async (data: IncidentFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await addIncident({
        name: data.name,
        severityId: data.severityId || "",
        parentId: data.parentId || undefined,
      });
      if (result.success) {
        toast({
          title: "Success",
          description: "Incident added successfully",
        });
        handleOpenChange(false);
        form.reset();
        setSelectedSeverityId("");
        parentIncidentSearchInputRef.current?.reset();
        setSelectedParentIncident(null);
      } else {
        toast({
          title: "Error",
          description: result.error,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while adding the incident",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditIncident = async (data: IncidentFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await editIncident({
        id: incidentId || "",
        name: data.name,
        severityId: data.severityId || "",
        parentId: data.parentId || undefined,
      });
      if (result.success) {
        toast({
          title: "Success",
          description: "Incident updated successfully",
        });
        handleOpenChange(false);
        form.reset();
        setSelectedSeverityId("");
        parentIncidentSearchInputRef.current?.reset();
        setSelectedParentIncident(null);
      } else {
        toast({
          title: "Error",
          description: result.error,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the incident",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {!controlledOpen && (
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Incident
            </Button>
          </DialogTrigger>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {incidentId ? "Edit Incident" : "Add New Incident"}
            </DialogTitle>
            <DialogDescription>
              {incidentId
                ? "Modify the incident details"
                : "Add a new incident to the system"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={
                incidentId
                  ? form.handleSubmit(handleEditIncident)
                  : form.handleSubmit(handleAddIncident)
              }
              className="space-y-4">
              <CardContent>
                <div className="grid gap-4 py-4">
                  {/* Add incident name */}
                  <div className="grid gap-2">
                    <Label>Incident Name</Label>
                    <Input {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Add parent incident */}
                  <div className="space-y-2">
                    <Label htmlFor="parentIncident">Parent Incident</Label>
                    <SearchInput
                      name="parentId"
                      onChange={(e) =>
                        form.setValue("parentId", e.target.value)
                      }
                      ref={parentIncidentSearchInputRef}
                      options={incidents}
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
                    {form.formState.errors.parentId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.parentId.message}
                      </p>
                    )}
                  </div>

                  {/* Add severity */}
                  <div className="grid gap-2">
                    <Label>Severity</Label>
                    <Select
                      value={selectedSeverityId}
                      onValueChange={(value) => {
                        setSelectedSeverityId(value);
                        form.setValue("severityId", value);
                      }}>
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
                    {form.formState.errors.severityId && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.severityId.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}>
                  Cancel
                </Button>
                {incidentId ? (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Editing..." : "Edit"}
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
