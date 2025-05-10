"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming correct path
import { ArrowLeft, Upload, FileImage } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming correct path

// Define the shape of the general info data
type GeneralInfo = {
  fullName: string;
  age: string;
  gender: string;
  contact: string; // Kept as string, could be more specific if needed
};

// --- GeneralInfoForm Component (from Snippet 1) ---
// Component for collecting general info before upload
const GeneralInfoForm: React.FC<{ onSubmit: (data: GeneralInfo) => void }> = ({ onSubmit }) => {
  const [formState, setFormState] = useState<GeneralInfo>({
    fullName: "",
    age: "",
    gender: "",
    contact: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation can be added here if needed
    onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formState.fullName}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div>
        <label htmlFor="age" className="block mb-1 text-sm font-medium text-gray-700">Age</label>
        <input
          id="age"
          type="number"
          name="age"
          value={formState.age}
          onChange={handleChange}
          required
          min="0" // Optional: basic validation
          className="w-full p-2 border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formState.gender}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="" disabled>Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact" className="block mb-1 text-sm font-medium text-gray-700">
          Contact Info <span className="text-xs text-gray-500">(Optional - e.g., email or phone)</span>
        </label>
        <input
          id="contact"
          type="text"
          name="contact"
          value={formState.contact}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
      >
        Save Info & Proceed to Upload
      </Button>
    </form>
  );
};

// --- Main ScanAssessmentPage Component (Integrated) ---
export default function ScanAssessmentPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null); // Consider defining a more specific type for the result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo | null>(null); // State to hold submitted general info
  const [infoSubmitted, setInfoSubmitted] = useState(false); // Track if form was submitted

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Reset results when a new file is selected
      setResult(null);
      setError(null);
    } else {
        // Clear preview if no file is selected (e.g., user cancels selection)
        setSelectedFile(null);
        setPreviewUrl(null);
    }
  };

  const handleUploadClick = () => {
    // Trigger the hidden file input
    document.getElementById("fileInput")?.click();
  };

  // Handles submission of the General Info form
  const handleInfoFormSubmit = (data: GeneralInfo) => {
    setGeneralInfo(data);
    setInfoSubmitted(true); // Mark info as submitted
    setError(null); // Clear previous errors
    console.log("General Info submitted:", data);
    // Optionally, scroll to the upload section or give visual feedback
  };

  // Handles the final submission (Analyze Scan)
  const handleScanSubmit = async () => {
    // 1. Check if General Info has been submitted
    if (!generalInfo) {
      setError("Please complete and save the 'General Info' section first.");
      // Optionally, focus or highlight the form section
      return;
    }

    // 2. Check if a file has been selected
    if (!selectedFile) {
      setError("Please select a scan file to upload.");
      return;
    }

    // 3. Start loading state and clear previous results/errors
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 4. Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        // Ensure result is string and split correctly
        reader.onload = () => {
            const resultString = reader.result as string;
            if (resultString && resultString.includes(',')) {
                resolve(resultString.split(",")[1]);
            } else {
                reject(new Error("Failed to read file correctly."));
            }
        };
        reader.onerror = (error) => reject(error);
      });

      // 5. Call backend API with both image and general info
      const response = await fetch("/api/check_scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64, // The base64 image data
          ...generalInfo, // Spread the collected general info
        }),
      });

      // 6. Process the response
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || `Error: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error("Error during scan submission:", err);
      setError("Error uploading or processing scan: " + (err.message || "Unknown error"));
    } finally {
      // 7. Reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50/30"> {/* Added subtle background */}
      {/* --- Header (from Snippet 2) --- */}
      <header className="sticky top-0 z-10 bg-white border-b border-pink-100 shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-pink-600">HER'S</span> {/* Placeholder Logo/Name */}
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link href="/" className="text-pink-950 hover:text-pink-600 transition-colors">Home</Link>
            <Link href="/chat" className="text-pink-950 hover:text-pink-600 transition-colors">Chat</Link>
            <Link href="/risk-assessment" className="text-pink-950 hover:text-pink-600 transition-colors">Risk Assessment</Link>
            <Link href="/scan-assessment" className="text-pink-600 font-medium">Scan Assessment</Link>
          </nav>
          {/* Add mobile menu button here if needed */}
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8"> {/* Added space-y for consistent spacing */}
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-6 text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-pink-900 mb-6 text-center md:text-left"> {/* Centered on small screens */}
            Breast Scan Assessment
          </h1>

          {/* --- 1. General Info Section --- */}
          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-pink-900">Step 1: General Information</CardTitle>
              <CardDescription>
                Please provide some basic information. This helps in contextualizing the scan analysis (optional fields can be skipped).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralInfoForm onSubmit={handleInfoFormSubmit} />
              {/* Optional: Display submitted info for confirmation */}
              {infoSubmitted && generalInfo && (
                 <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-800">General information saved:</p>
                    <pre className="mt-1 bg-white p-2 rounded text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(generalInfo, null, 2)}
                    </pre>
                 </div>
              )}
            </CardContent>
          </Card>

          {/* --- 2. Upload and Analyze Section --- */}
          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-pink-900">Step 2: Upload & Analyze Scan</CardTitle>
              <CardDescription>
                Upload your mammogram, ultrasound, or MRI scan image (JPEG, PNG). Ensure your general info is saved first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`border-2 border-dashed border-pink-200 rounded-lg p-8 text-center ${!infoSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FileImage className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                <h3 className="text-lg font-medium text-pink-900 mb-2">
                  {selectedFile ? selectedFile.name : "Drag and drop or browse"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">Accepts: JPEG, PNG formats</p>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/jpeg,image/png" // Removed DICOM for simplicity based on description text
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={!infoSubmitted} // Disable file input until info is submitted
                />
                 {/* File Upload Button */}
                <Button
                  className="bg-pink-600 hover:bg-pink-700 mb-4"
                  onClick={handleUploadClick}
                  disabled={!infoSubmitted} // Disable button until info is submitted
                >
                  <Upload className="w-4 h-4 mr-2" /> {selectedFile ? "Change File" : "Browse File"}
                </Button>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-4">
                     <img
                    src={previewUrl}
                    alt="Scan Preview"
                    className="mx-auto max-h-64 object-contain rounded-md border border-pink-100"
                  />
                  </div>
                )}

                {/* Analyze Button - Enabled only when info is submitted AND a file is selected */}
                <Button
                  className="mt-6 bg-pink-800 hover:bg-pink-900 text-white w-full md:w-auto" // Made bolder
                  onClick={handleScanSubmit}
                  disabled={loading || !selectedFile || !infoSubmitted} // Key logic change
                >
                  {loading ? "Analyzing..." : "Analyze Scan"}
                </Button>

                {/* Error Display */}
                {error && (
                  <p className="mt-4 text-red-600 font-medium text-sm">{error}</p>
                )}

                {/* Result Display */}
                {result && !error && (
                  <div className="mt-6 p-4 border border-pink-200 rounded-md bg-white text-left text-pink-900">
                    <h3 className="text-lg font-semibold mb-2">
                      Analysis Result:
                    </h3>
                    {/* Nicer formatting for results could be implemented here */}
                    <div className="text-sm bg-gray-50 p-3 rounded">
  <p><span className="font-medium">Predicted Class:</span> {result?.current?.predictions?.[0]?.class || "No prediction available"}</p>
</div>
 
                    {/* Add disclaimer about consulting a doctor */}
                     <p className="mt-3 text-xs text-red-700 font-medium">
                        Disclaimer: This is an AI analysis and not a medical diagnosis. Always consult a qualified healthcare professional.
                     </p>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="mt-6 bg-pink-50 p-4 rounded-md">
                <p className="text-sm text-pink-700">
                  <strong>Privacy Notice:</strong> Your scan and information are processed
                  securely for analysis and are not stored permanently. Analysis uses AI with privacy controls.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* --- How it works Section (from Snippet 2) --- */}
          <Card className="border-pink-100 shadow-sm">
             <CardHeader>
               <CardTitle className="text-pink-900">How It Works</CardTitle>
               <CardDescription>
                 Understanding the scan assessment process
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {/* Step 1 */}
                 <div className="flex items-start">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                     <span className="font-medium text-pink-600">1</span>
                   </div>
                   <div>
                     <h4 className="font-medium text-pink-900">Provide Info</h4>
                     <p className="text-gray-600 text-sm">Enter general details in Step 1.</p>
                   </div>
                 </div>
                 {/* Step 2 */}
                 <div className="flex items-start">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                     <span className="font-medium text-pink-600">2</span>
                   </div>
                   <div>
                     <h4 className="font-medium text-pink-900">Upload Scan</h4>
                     <p className="text-gray-600 text-sm">Upload your scan image in Step 2.</p>
                   </div>
                 </div>
                 {/* Step 3 */}
                 <div className="flex items-start">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                     <span className="font-medium text-pink-600">3</span>
                   </div>
                   <div>
                     <h4 className="font-medium text-pink-900">AI Analysis</h4>
                     <p className="text-gray-600 text-sm">Our AI analyzes the scan using the provided context.</p>
                   </div>
                 </div>
                 {/* Step 4 */}
                 <div className="flex items-start">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                     <span className="font-medium text-pink-600">4</span>
                   </div>
                   <div>
                     <h4 className="font-medium text-pink-900">Review Results</h4>
                     <p className="text-gray-600 text-sm">Receive the analysis report.</p>
                   </div>
                 </div>
                 {/* Step 5 */}
                 <div className="flex items-start">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                     <span className="font-medium text-pink-600">5</span>
                   </div>
                   <div>
                     <h4 className="font-medium text-pink-900">Consult Professional</h4>
                     <p className="text-gray-600 text-sm">Share results with your doctor for diagnosis.</p>
                   </div>
                 </div>
               </div>
                {/* Important Disclaimer */}
               <div className="mt-6 p-4 border border-yellow-300 rounded-md bg-yellow-50">
                 <p className="text-sm text-yellow-800 font-medium">Important Disclaimer</p>
                 <p className="text-sm text-yellow-700 mt-1">
                   This tool assists in detection and is NOT a substitute for professional medical diagnosis. Always consult a healthcare provider.
                 </p>
               </div>
             </CardContent>
           </Card>
        </div>
      </main>

      {/* --- Footer (from Snippet 2) --- */}
      <footer className="py-6 bg-pink-900 text-pink-100 mt-12"> {/* Added margin-top */}
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-pink-300">&copy; {new Date().getFullYear()} HER'S. All rights reserved.</p>
           {/* Add privacy policy/terms links if needed */}
        </div>
      </footer>
    </div>
  );
}