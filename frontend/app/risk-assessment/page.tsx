
"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const quiz = {
  title: "Understanding Your Risk for Breast Cancer: A Self-Assessment Quiz",
  description:
    "This self-assessment quiz provides preliminary information about potential risk factors for developing breast cancer. It serves as an informational tool for initial self-evaluation and is not a substitute for professional medical advice.",
  disclaimer:
    "This quiz is intended for informational purposes only and should not be considered a substitute for professional medical advice. Consult with a healthcare professional for a personalized breast cancer risk assessment.",
  questions: [
    {
      id: 1,
      question: "What is your current age?",
    },
    {
      id: 2,
      question:
        "Do you have any first-degree relatives (mother, sister, daughter) who have been diagnosed with breast cancer?",
    },
    {
      id: 3,
      question: "Have you ever been diagnosed with breast cancer?",
    },
    {
      id: 4,
      question:
        "Have you ever been diagnosed with any of the following benign breast conditions after a biopsy: atypical ductal hyperplasia (ADH) or lobular carcinoma in situ (LCIS)?",
    },
    {
      id: 5,
      question:
        "Have you ever had genetic testing that showed you have a mutation in the BRCA1 or BRCA2 gene, or another gene associated with increased breast cancer risk?",
    },
    {
      id: 6,
      question:
        "Have you been told by your doctor that you have dense breast tissue based on your mammogram?",
    },
    {
      id: 7,
      question: "At what age did you start menstruating?",
    },
    {
      id: 8,
      question: "At what age did you go through menopause (if applicable)?",
    },
    {
      id: 9,
      question: "On average, how many alcoholic drinks do you consume per week?",
    },
    {
      id: 10,
      question: "What is your approximate Body Mass Index (BMI)?",
    },
    {
      id: 11,
      question: "How many hours of moderate-intensity physical activity do you typically engage in per week?",
    },
    {
      id: 12,
      question:
        "Are you currently taking or have you taken menopausal hormone therapy (HT) for 5 years or more?",
    },
    {
      id: 13,
      question: "At what age did you have your first full-term pregnancy?",
    },
    {
      id: 14,
      question:
        "Have you ever received radiation therapy to your chest area before the age of 30?",
    },
  ],
}

export default function RiskAssessmentPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleInputChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Construct conversation array as per backend expectation
      const conversation = [{ role: "user", content: "Starting risk assessment quiz." }]
      quiz.questions.forEach((q) => {
        conversation.push({ role: "assistant", content: `Q${q.id}: ${q.question}` })
        conversation.push({ role: "user", content: answers[q.id] || "" })
      })

      const response = await fetch("/api/risk-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-pink-100">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-pink-600">BrestCare</span>
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link href="/" className="text-pink-950 hover:text-pink-600 transition-colors">Home</Link>
            <Link href="/chat" className="text-pink-950 hover:text-pink-600 transition-colors">Chat</Link>
            <Link href="/risk-assessment" className="text-pink-600 font-medium">Risk Assessment</Link>
            <Link href="/scan-assessment" className="text-pink-950 hover:text-pink-600 transition-colors">Scan Assessment</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-0">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-pink-900 mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          <p className="text-sm text-pink-700 bg-pink-50 p-3 rounded-md mb-8">{quiz.disclaimer}</p>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {quiz.questions.map((q) => (
              <Card key={q.id} className="border-pink-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-pink-900">{q.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label htmlFor={`q${q.id}`} className="text-pink-900">
                    Your Answer
                  </Label>
                  <input
                    type="text"
                    id={`q${q.id}`}
                    name={`q${q.id}`}
                    className="w-full mt-1 px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                  />
                </CardContent>
              </Card>
            ))}

            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={loading}>
              {loading ? "Submitting..." : "Submit Answers"}
            </Button>
          </form>

          {error && <p className="mt-6 text-red-600 font-semibold">{error}</p>}

          {result && (
            <div className="mt-8 p-4 border border-pink-300 rounded-md bg-pink-50">
              <h2 className="text-xl font-bold text-pink-900 mb-2">Risk Assessment Result</h2>
<p className="mt-8 p-4 border border-pink-300 rounded-md bg-pink-50 text-pink-900">
  {result.risk_assessment_result}
</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 bg-pink-900 text-pink-100">
        <div className="container px-4 mx-auto text-center">
          <p className="text-pink-300">&copy; {new Date().getFullYear()} BrestCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
