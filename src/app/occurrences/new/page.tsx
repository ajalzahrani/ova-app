import { createOccurrence } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewOccurrencePage() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">إنشاء OVA جديدة</h1>

      <form action={createOccurrence} className="space-y-4">
        <div>
          <label className="block mb-1">عنوان المشكلة</label>
          <Input name="title" required />
        </div>

        <div>
          <label className="block mb-1">وصف المشكلة</label>
          <Textarea name="description" rows={5} required />
        </div>

        <Button type="submit">إرسال</Button>
      </form>
    </div>
  );
}
