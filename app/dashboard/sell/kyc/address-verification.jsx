"use client"

import { useState } from "react";
import { uploadKycDocument } from "@/lib/edgeStore";
import { Button } from "@/app/components/button";

export default function AddressVerification() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const url = await uploadKycDocument(file);
      // Save the URL to your database (e.g., via an API call)
      console.log("Uploaded document URL:", url);
    } catch (err) {
      setError("Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Address Verification</h2>
      <input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </Button>
      {error && <p>{error}</p>}
    </div>
  );
} 