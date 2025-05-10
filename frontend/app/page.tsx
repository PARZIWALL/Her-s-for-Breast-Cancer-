import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, MessageCircle, ClipboardCheck, ScanLine } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-pink-100">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-pink-600">BrestCare</span>
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link href="/" className="text-pink-950 hover:text-pink-600 transition-colors">
              Home
            </Link>
            <Link href="/chat" className="text-pink-950 hover:text-pink-600 transition-colors">
              Chat
            </Link>
            <Link href="/risk-assessment" className="text-pink-950 hover:text-pink-600 transition-colors">
              Risk Assessment
            </Link>
            <Link href="/scan-assessment" className="text-pink-950 hover:text-pink-600 transition-colors">
              Scan Assessment
            </Link>
          </nav>
          <div className="md:hidden">
            {/* Mobile menu button would go here */}
            <Button variant="ghost" size="icon" className="text-pink-950">
              <span className="sr-only">Open menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-pink-50 to-white">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight text-pink-900 sm:text-5xl md:text-6xl">
                Early Detection Saves Lives
              </h1>
              <p className="mt-6 text-xl text-pink-700">
                Our comprehensive breast cancer detection tools help you stay informed, assess your risk, and take
                control of your health.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Button className="bg-pink-600 hover:bg-pink-700">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-pink-900">Our Services</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="p-2 mb-4 rounded-full bg-pink-50 w-fit">
                    <MessageCircle className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-pink-900">AI Chatbot</CardTitle>
                  <CardDescription>Get instant answers to your breast health questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our AI-powered chatbot provides reliable information about breast cancer, symptoms, and preventive
                    measures.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/chat">
                    <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-0">
                      Start chatting <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="p-2 mb-4 rounded-full bg-pink-50 w-fit">
                    <ClipboardCheck className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-pink-900">Risk Assessment</CardTitle>
                  <CardDescription>Evaluate your personal risk factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Take our comprehensive quiz to understand your risk level based on family history, lifestyle, and
                    other factors.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/risk-assessment">
                    <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-0">
                      Take assessment <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="p-2 mb-4 rounded-full bg-pink-50 w-fit">
                    <ScanLine className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-pink-900">Scan Assessment</CardTitle>
                  <CardDescription>Advanced imaging analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Upload your mammogram or ultrasound images for AI-assisted analysis and early detection support.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/scan-assessment">
                    <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-0">
                      Upload scan <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-pink-50">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-pink-900">Why Early Detection Matters</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-6 text-center bg-white rounded-lg shadow-sm">
                <p className="text-4xl font-bold text-pink-600">99%</p>
                <p className="mt-2 text-gray-700">5-year survival rate when breast cancer is detected early</p>
              </div>
              <div className="p-6 text-center bg-white rounded-lg shadow-sm">
                <p className="text-4xl font-bold text-pink-600">1 in 8</p>
                <p className="mt-2 text-gray-700">Women will develop breast cancer in their lifetime</p>
              </div>
              <div className="p-6 text-center bg-white rounded-lg shadow-sm">
                <p className="text-4xl font-bold text-pink-600">30%</p>
                <p className="mt-2 text-gray-700">Reduction in mortality through regular screening</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <div className="p-8 text-center bg-gradient-to-r from-pink-100 to-pink-50 rounded-xl">
              <h2 className="text-3xl font-bold text-pink-900">Take Control of Your Breast Health Today</h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-pink-700">
                Regular screenings and risk assessments are key to early detection. Start your journey to better breast
                health now.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link href="/risk-assessment">
                  <Button className="bg-pink-600 hover:bg-pink-700">Start Risk Assessment</Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                    Chat with AI Assistant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-pink-900 text-pink-100">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-semibold">BrestCare</h3>
              <p className="text-pink-200">Dedicated to breast cancer awareness, early detection, and support.</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/chat" className="text-pink-200 hover:text-white">
                    Chat
                  </Link>
                </li>
                <li>
                  <Link href="/risk-assessment" className="text-pink-200 hover:text-white">
                    Risk Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/scan-assessment" className="text-pink-200 hover:text-white">
                    Scan Assessment
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-pink-200 hover:text-white">
                    About Breast Cancer
                  </a>
                </li>
                <li>
                  <a href="#" className="text-pink-200 hover:text-white">
                    Support Groups
                  </a>
                </li>
                <li>
                  <a href="#" className="text-pink-200 hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 text-center border-t border-pink-800">
            <p className="text-pink-300">&copy; {new Date().getFullYear()} BrestCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
