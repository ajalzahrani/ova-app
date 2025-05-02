"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/feedback/submit`, {
      method: "POST",
      body: JSON.stringify({ token, message }),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("Failed to submit feedback. The link may have expired.");
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
