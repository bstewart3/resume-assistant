"use client";

import { useChat } from "ai/react";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";

import { useState } from "react";

import Image from "next/image";
import reswiz from "../public/reswiz.png";
import FileUploader from "./FileUploader";
import SectionWithSuggestion from "./SectionWithSuggestion";
import Spinner from "./Spinner";

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
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const chatOptions = {
    api: "/api/chat", // endpoint
    body: {
      userResume: resume,
    },
  };

  const processSections = (text) => {
    const sectionArray = text.split("SECTION: ").slice(1); // Remove first empty string
    const sections = sectionArray.map((sectionText) => {
      const [title, content] = sectionText.split("SECTION-CONTENT: ");
      return { title, content: content.trim() };
    });
    setSections(sections);
    console.log(sections);
  };

  const { messages, input, handleInputChange, handleSubmit, body } =
    useChat(chatOptions);

  const handleUpdate = async (file) => {
    try {
      setIsLoading(true);
      const content = await parseFile(file);
      console.log(content);
      setResume(content);
      const res = await fetch("api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [`user: ${content}`],
        }),
      });

      const reader = res.body.getReader();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += new TextDecoder().decode(value);
        console.log(text); // Log the received chunk
      }

      // const parsedResponse = await res.json();
      // console.log(parsedResponse);
      // setSections(parsedResponse.sections);
      // console.log(sections);

      console.log("Complete response: ", text);
      processSections(text);
    } catch (error) {
      console.error("Error parsing file:", error);
      // Handle the error appropriately in your UI
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="flex flex-col w-full p-8 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col w-full items-center space-y-4">
        {resume === "" && (
          <>
            <Image
              src={reswiz}
              width={500}
              height={500}
              alt="Picture of the author"
              className="rounded-md"
            />
            <FileUploader
              onUpdate={handleUpdate}
              className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out"
            />
          </>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-screen space-x-4">
            <Spinner />
            <h3 className="text-gray-600">Loading Resume Sections...</h3>
          </div>
        ) : (
          <div className="sections-container space-y-4">
            {sections.map((section, index) => (
              <SectionWithSuggestion key={index} {...section} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
