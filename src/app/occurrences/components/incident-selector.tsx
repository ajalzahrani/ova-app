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
  defaultIncidentId?: string;
}

export function IncidentSelector({
  onIncidentChange,
  defaultIncidentId,
}: IncidentSelectorProps) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [subIncidents, setSubIncidents] = useState<any[]>([]);
  const [subSubIncidents, setSubSubIncidents] = useState<any[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("");
  const [selectedSubIncidentId, setSelectedSubIncidentId] =
    useState<string>("");
  const [selectedSubSubIncidentId, setSelectedSubSubIncidentId] =
    useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch top-level incidents on component mount
  useEffect(() => {
    async function fetchIncidents() {
      const data = await getTopLevelIncidents();
      setIncidents(data || []);
    }
    fetchIncidents();
  }, []);

  // Handle defaultIncidentId when incidents are loaded
  useEffect(() => {
    if (defaultIncidentId && incidents.length > 0 && !isInitialized) {
      // Check if defaultIncidentId is a top-level incident
      const foundTopLevel = incidents.find(
        (inc) => inc.id === defaultIncidentId
      );
      if (foundTopLevel) {
        setSelectedIncidentId(defaultIncidentId);
        setIsInitialized(true);
        return;
      }

      // If not found at top level, we'll need to check sub-levels for each top incident
      async function findInHierarchy() {
        for (const topIncident of incidents) {
          // Check in sub-incidents
          const subIncs = await getSubIncidents(topIncident.id);
          const foundSub = subIncs?.find((sub) => sub.id === defaultIncidentId);

          if (foundSub) {
            setSelectedIncidentId(topIncident.id);
            setSelectedSubIncidentId(defaultIncidentId || "");
            setIsInitialized(true);
            return;
          }

          // Check in sub-sub-incidents for each sub-incident
          for (const subInc of subIncs || []) {
            const subSubIncs = await getSubSubIncidents(subInc.id);
            const foundSubSub = subSubIncs?.find(
              (subSub) => subSub.id === defaultIncidentId
            );

            if (foundSubSub) {
              setSelectedIncidentId(topIncident.id);
              setSelectedSubIncidentId(subInc.id);
              setSelectedSubSubIncidentId(defaultIncidentId || "");
              setIsInitialized(true);
              return;
            }
          }
        }

        // If we get here, the ID wasn't found in the hierarchy
        // Just set it as the top level ID as fallback
        if (defaultIncidentId) {
          setSelectedIncidentId(defaultIncidentId);
          setIsInitialized(true);
        }
      }

      findInHierarchy();
    }
  }, [defaultIncidentId, incidents, isInitialized]);

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
  }, [selectedIncidentId, selectedSubIncidentId]);

  // Handle top-level incident selection
  const handleIncidentChange = (value: string) => {
    setSelectedIncidentId(value);
    setSelectedSubIncidentId("");
    setSelectedSubSubIncidentId("");
    onIncidentChange(value); // Update parent form
  };

  // Handle sub-incident selection
  const handleSubIncidentChange = (value: string) => {
    setSelectedSubIncidentId(value);
    setSelectedSubSubIncidentId("");
    onIncidentChange(value); // Update parent form
  };

  // Handle sub-sub-incident selection
  const handleSubSubIncidentChange = (value: string) => {
    setSelectedSubSubIncidentId(value);
    onIncidentChange(value); // Update parent form
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="incidentType">Incident Type</Label>
      <Select
        onValueChange={handleIncidentChange}
        value={selectedIncidentId}
        defaultValue={selectedIncidentId}>
        <SelectTrigger id="incidentType">
          <SelectValue placeholder="Select incident type" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
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
          <Select
            onValueChange={handleSubIncidentChange}
            value={selectedSubIncidentId}
            defaultValue={selectedSubIncidentId}>
            <SelectTrigger id="subIncidentType">
              <SelectValue placeholder="Select sub-category" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
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
          <Select
            onValueChange={handleSubSubIncidentChange}
            value={selectedSubSubIncidentId}
            defaultValue={selectedSubSubIncidentId}>
            <SelectTrigger id="subSubIncidentType">
              <SelectValue placeholder="Select sub-sub-category" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
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
