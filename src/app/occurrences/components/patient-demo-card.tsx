import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PatientDemoCardProps {
  FirstName: string;
  LastName: string;
  MRN: string;
  MobileNo: string;
  FatherName: string;
}

export function PatientDemoCard({
  patientDetails,
}: {
  patientDetails: PatientDemoCardProps;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="font-normal text-sm text-foreground">
              {patientDetails.FirstName} {patientDetails.FatherName}{" "}
              {patientDetails.LastName}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">MRN</span>
            <span className="font-normal text-sm text-foreground">
              {patientDetails.MRN}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Mobile No</span>
            <span className="font-normal text-sm text-foreground">
              {patientDetails.MobileNo}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
