import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSubIncidents,
  getSubSubIncidents,
  getTopLevelIncidents,
} from "@/actions/incidents";

interface IncidentSelectorProps {
  onIncidentChange: (incidentId: string) => void;
}

export function IncidentSelector({ onIncidentChange }: IncidentSelectorProps) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [subIncidents, setSubIncidents] = useState<any[]>([]);
  const [subSubIncidents, setSubSubIncidents] = useState<any[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("");
  const [selectedSubIncidentId, setSelectedSubIncidentId] =
    useState<string>("");

  // Fetch top-level incidents on component mount
  useEffect(() => {
    async function fetchIncidents() {
      const data = await getTopLevelIncidents();
      setIncidents(data || []);
    }
    fetchIncidents();
  }, []);

  // Fetch sub-incidents when a parent is selected
  useEffect(() => {
    if (!selectedIncidentId) {
      setSubIncidents([]);
      return;
    }

    async function fetchSubIncidents() {
      const data = await getSubIncidents(selectedIncidentId);
      setSubIncidents(data || []);
    }
    fetchSubIncidents();
  }, [selectedIncidentId]);

  // Fetch sub-sub-incidents when a sub-incident is selected
  useEffect(() => {
    if (!selectedIncidentId || !selectedSubIncidentId) {
      setSubSubIncidents([]);
      return;
    }

    async function fetchSubSubIncidents() {
      const data = await getSubSubIncidents(selectedSubIncidentId);
      setSubSubIncidents(data || []);
    }
    fetchSubSubIncidents();
  }, [selectedSubIncidentId]);

  // Handle top-level incident selection
  const handleIncidentChange = (value: string) => {
    setSelectedIncidentId(value);
    setSelectedSubIncidentId("");
    onIncidentChange(value); // Update parent form
  };

  // Handle sub-incident selection
  const handleSubIncidentChange = (value: string) => {
    setSelectedSubIncidentId(value);
    onIncidentChange(value); // Update parent form
  };

  // Handle sub-sub-incident selection
  const handleSubSubIncidentChange = (value: string) => {
    onIncidentChange(value); // Update parent form
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="incidentType">Incident Type</Label>
      <Select onValueChange={handleIncidentChange} defaultValue="">
        <SelectTrigger id="incidentType">
          <SelectValue placeholder="Select incident type" />
        </SelectTrigger>
        <SelectContent>
          {incidents.map((incident) => (
            <SelectItem key={incident.id} value={incident.id}>
              {incident.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {subIncidents.length > 0 && (
        <div className="mt-4">
          <Label htmlFor="subIncidentType">Sub-Category</Label>
          <Select onValueChange={handleSubIncidentChange} defaultValue="">
            <SelectTrigger id="subIncidentType">
              <SelectValue placeholder="Select sub-category" />
            </SelectTrigger>
            <SelectContent>
              {subIncidents.map((subIncident) => (
                <SelectItem key={subIncident.id} value={subIncident.id}>
                  {subIncident.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {subSubIncidents.length > 0 && (
        <div className="mt-4">
          <Label htmlFor="subSubIncidentType">Sub-Sub-Category</Label>
          <Select onValueChange={handleSubSubIncidentChange} defaultValue="">
            <SelectTrigger id="subSubIncidentType">
              <SelectValue placeholder="Select sub-sub-category" />
            </SelectTrigger>
            <SelectContent>
              {subSubIncidents.map((subSubIncident) => (
                <SelectItem key={subSubIncident.id} value={subSubIncident.id}>
                  {subSubIncident.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
