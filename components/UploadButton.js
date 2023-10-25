"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function UploadButton(props) {
  const [file, setFile] = useState(null);
  const router = useRouter();

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onUpload = async () => {
    console.log(file);
    props.onUpdate(file);
  };

  return (
    <div>
      <h2>Upload Your Resume </h2>

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={onFileChange}
      />
      <button onClick={onUpload}>Upload</button>
    </div>
  );
}

export default UploadButton;
