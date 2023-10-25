"use client";

import { useChat } from "ai/react";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";

import { useState } from "react";
import FileUploader from "./FileUploader";

async function parseFile(file) {
  const fileType = file.type;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = event.target.result;

      try {
        if (fileType === "text/plain") {
          resolve(data);
        } else if (
          fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const output = await mammoth.extractRawText({ arrayBuffer: data });
          resolve(output.value);
        } else if (fileType === "application/pdf") {
          console.log("PDF ENTRE");

          // Ensure the workerSrc is set
          pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

          const pdf = await pdfjs.getDocument({ data }).promise;

          let textContent = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map((item) => item.str).join(" ");
          }
          resolve(textContent);
        } else {
          reject(new Error("Unsupported file type"));
        }
      } catch (err) {
        reject(err);
      }
    };

    if (fileType === "text/plain") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

export default function Chat() {
  const [resume, setResume] = useState("");

  const chatOptions = {
    api: "/api/chat", // endpoint
    body: {
      userResume: resume,
    },
  };

  const { messages, input, handleInputChange, handleSubmit, body } =
    useChat(chatOptions);

  const handleUpdate = async (file) => {
    try {
      const content = await parseFile(file);
      console.log(content);
      setResume(content);
      // const res = await fetch("api/parse", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     messages: [`user: ${content}`],
      //   }),
      // });
      // const data = await res.text();
      // console.log(data);
    } catch (error) {
      console.error("Error parsing file:", error);
      // Handle the error appropriately in your UI
    }
  };

  return (
    <div className="flex flex-col md:flex-row mx-auto w-full md:max-w-3xl p-4">
      {/* Resume Text Container */}
      <div className="w-full md:w-1/2 md:pl-2 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{resume}</pre>
      </div>
      {/* Chat Messages Container */}
      <div className="flex flex-col w-full md:w-1/2 md:pr-2 mb-4 md:mb-0">
        {resume === "" ? <FileUploader onUpdate={handleUpdate} /> : ""}

        <div className="flex flex-col h-full overflow-y-auto mb-4">
          {messages.length > 0
            ? messages.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap mb-2">
                  {m.role === "user" ? "User: " : "AI: "}
                  {m.content}
                </div>
              ))
            : null}
        </div>
        <form onSubmit={handleSubmit} className="mt-auto">
          <input
            className="w-full border border-gray-300 rounded mb-8 p-2"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}
