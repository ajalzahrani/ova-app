"use client";

import { use, useState } from "react";
import { submitFeedback } from "@/actions/feedbacks";

type PageParams = {
  token: string;
};

export default function FeedbackForm({
  params,
}: {
  params: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const token = resolvedParams.token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await submitFeedback(token, message);

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      alert(res.error);
    }
  };

  if (submitted) {
    return <p className="text-green-600">Thank you for your feedback!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full border rounded p-2"
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your feedback here..."
        required
      />
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}>
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
