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
  deleteIncident,
  editIncident,
  getAllIncidents,
  getAllSeverities,
} from "@/actions/incidents";
import { useRouter } from "next/navigation";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

export function AddIncidentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [parentIncidents, setParentIncidents] = useState<Incident[]>([]);
  const [selectedParentIncident, setSelectedParentIncident] =
    useState<Incident | null>(null);

  const parentIncidentSearchInputRef = useRef<SearchInputRef>(null);

  const handleParentIncidentChange = (incident: Incident | null) => {
    setSelectedParentIncident(incident);
    if (incident) {
      form.setValue("parentId", incident.id);
    } else {
      form.setValue("parentId", undefined);
    }
  };

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
        setOpen(false);
        form.reset();
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Incident
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Incident</DialogTitle>
            <DialogDescription>
              Add a new incident to the system
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddIncident)}
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
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
