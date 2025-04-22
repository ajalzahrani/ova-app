import { assignToDepartments } from "./actions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default async function OccurrenceDetails({
  params,
}: {
  params: { id: string };
}) {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: params.id },
    include: { createdBy: true, assignments: true },
  });

  const departments = await prisma.department.findMany();

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h1 className="text-xl font-bold">{occurrence?.title}</h1>
      <p className="text-gray-700">{occurrence?.description}</p>

      <form
        action={async (formData) => {
          "use server";
          const selected = formData.getAll("departments") as string[];
          await assignToDepartments(params.id, selected);
        }}
        className="space-y-4">
        <h2 className="font-semibold">اختر الأقسام للتحويل:</h2>

        <div className="space-y-2">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <Checkbox id={d.id} name="departments" value={d.id} />
              <label htmlFor={d.id}>{d.name}</label>
            </div>
          ))}
        </div>

        <Button type="submit">تحويل</Button>
      </form>
    </div>
  );
}
