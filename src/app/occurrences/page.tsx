import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const OccurrencesPage = async () => {
  const occurrences = await prisma.occurrence.findMany();
  return (
    <div>
      <h1>Occurrences</h1>
      <Button>
        <Link href="/occurrences/new">New Occurrence</Link>
      </Button>
      <ul>
        {occurrences.map((occurrence) => (
          <Link href={`/occurrences/${occurrence.id}`} key={occurrence.id}>
            <li key={occurrence.id}>{occurrence.title}</li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default OccurrencesPage;
