import { useEffect, useState } from "react";

export default function SectionWithSuggestion({ title, content }) {
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("api/suggestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [`user: ${title}${content}`] }),
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const reader = res.body.getReader();
        let text = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += new TextDecoder().decode(value);
          console.log(text); // Log the received chunk
        }

        console.log("Complete response: ", text);
        setSuggestion(text);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [title, content]);

  return (
    <div className="flex border p-4 space-x-4">
      <pre className="flex-1 bg-gray-100 p-4 rounded overflow-y-auto">
        {content}
      </pre>
      <div className="flex-1 bg-green-100 p-4 rounded overflow-y-auto whitespace-pre-wrap">
        {suggestion}
      </div>
    </div>
  );
}
