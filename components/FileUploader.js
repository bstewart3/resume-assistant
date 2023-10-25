// components/FileUploader.js

import { useRef, useState } from "react";

export default function FileUploader(props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const updateResume = (file) => {
    props.onUpdate(file);
  };

  const processFiles = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      console.log("File:", file);
      updateResume(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    processFiles(files);
  };

  return (
    <div
      className={`border-dashed border-4 ${
        isDragging ? "border-blue-500" : "border-gray-500"
      } p-10 text-center cursor-pointer`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.doc"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <p>Drag & Drop your file here or click to select one</p>
    </div>
  );
}
