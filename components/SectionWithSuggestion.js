import { useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function SectionWithSuggestion({ title, content }) {
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Start loading
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
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchData();
  }, [title, content]);

  return (
    <div className="flex border p-4 space-x-4 mt-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-md shadow-sm">
      <div className="w-1/2">
        <h4 className="text-blue-600 font-semibold mb-2">{title}</h4>
        <pre className="flex-1 bg-white p-4 rounded overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words max-w-lg shadow-sm">
          {content}
        </pre>
      </div>
      <div className="w-1/2">
        <h4 className="text-green-600 font-semibold mb-2">Suggestion</h4>
        <div className="flex-1 bg-white p-4 rounded overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words max-w-lg shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
              <h3 className="ml-4 text-gray-600">Loading Suggestions..</h3>
            </div>
          ) : (
            suggestion
          )}
        </div>
      </div>
    </div>
  );
}
