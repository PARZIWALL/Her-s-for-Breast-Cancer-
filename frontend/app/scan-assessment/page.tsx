"use client"
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileImage } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ScanAssessmentPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleUploadClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });

      // Call backend API
      const response = await fetch("/api/check_scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Error processing scan.");
      }
    } catch (err) {
      setError("Error uploading scan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-pink-100">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-pink-600">HER'S</span>
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link
              href="/"
              className="text-pink-950 hover:text-pink-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/chat"
              className="text-pink-950 hover:text-pink-600 transition-colors"
            >
              Chat
            </Link>
            <Link
              href="/risk-assessment"
              className="text-pink-950 hover:text-pink-600 transition-colors"
            >
              Risk Assessment
            </Link>
            <Link
              href="/scan-assessment"
              className="text-pink-600 font-medium"
            >
              Scan Assessment
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-6 text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-pink-900 mb-6">
            Breast Scan Assessment
          </h1>

          <Card className="border-pink-100 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-pink-900">Upload your scan</CardTitle>
              <CardDescription>
                Our AI system can analyze mammograms, ultrasounds, and MRI scans
                to help identify potential areas of concern.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Upload your breast scan image for analysis. We accept JPEG, PNG,
                and DICOM file formats.
              </p>

              <div className="border-2 border-dashed border-pink-200 rounded-lg p-8 text-center">
                <FileImage className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                <h3 className="text-lg font-medium text-pink-900 mb-2">
                  Drag and drop your scan
                </h3>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/jpeg,image/png,image/dicom"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={handleUploadClick}
                >
                  <Upload className="w-4 h-4 mr-2" /> Browse files
                </Button>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto mt-4 max-h-64 object-contain rounded-md"
                  />
                )}
                <Button
                  className="mt-6 bg-pink-600 hover:bg-pink-700"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Analyze Scan"}
                </Button>
                {error && (
                  <p className="mt-4 text-red-600 font-medium">{error}</p>
                )}
                {result && (
                  <div className="mt-6 p-4 border border-pink-200 rounded-md bg-white text-pink-900">
                    <h3 className="text-lg font-semibold mb-2">
                      Analysis Result:
                    </h3>
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-pink-50 p-4 rounded-md">
                <p className="text-sm text-pink-700">
                  <strong>Privacy Notice:</strong> Your scan is processed
                  securely and is not stored permanently on our servers. All
                  analysis is performed using advanced AI algorithms with strict
                  privacy controls.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-pink-900">How it works</CardTitle>
              <CardDescription>
                Understanding our AI-powered scan assessment process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                    <span className="font-medium text-pink-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-pink-900">Upload your scan</h4>
                    <p className="text-gray-600">
                      Upload your mammogram, ultrasound, or MRI scan in a supported
                      format.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                    <span className="font-medium text-pink-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-pink-900">AI Analysis</h4>
                    <p className="text-gray-600">
                      Our advanced AI algorithms analyze the scan to identify
                      potential areas of concern.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                    <span className="font-medium text-pink-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-pink-900">Review Results</h4>
                    <p className="text-gray-600">
                      Receive a detailed report highlighting any areas that may
                      require further examination.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                    <span className="font-medium text-pink-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-pink-900">Consult a Professional</h4>
                    <p className="text-gray-600">
                      Always share your results with a healthcare professional for
                      proper diagnosis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 border border-pink-200 rounded-md bg-white">
                <p className="text-sm text-pink-900 font-medium">Important Disclaimer</p>
                <p className="text-sm text-gray-600 mt-1">
                  This tool is designed to assist in early detection but is not a
                  replacement for professional medical diagnosis. Always consult
                  with a healthcare provider regarding your scan results.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 bg-pink-900 text-pink-100">
        <div className="container px-4 mx-auto text-center">
          <p className="text-pink-300">&copy; {new Date().getFullYear()} HER'S. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
