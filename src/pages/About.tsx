import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";
import logo from "@/assets/logo.png";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section with Logo */}
      <div className="relative overflow-hidden">
        {/* Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
        
        {/* Top Dark Section with Logo */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <img
                src={logo}
                alt="CollabHub Logo"
                className="relative w-48 h-48 mx-auto object-contain drop-shadow-2xl"
              />
            </div>
            
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-4 tracking-wide">
              COLLAB HUB
            </h1>
          </div>
        </div>
        
        {/* Gradient Bar */}
        <div className="h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed text-center mb-12">
          Empowering students to collaborate, learn, and build together through innovative technology and community-driven experiences.
        </p>

        {/* Founder Card */}
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm max-w-3xl mx-auto shadow-2xl">
          <CardHeader className="border-b border-slate-700">
            {/* Gradient Bar in Card */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-6 rounded-full"></div>
            
            <CardTitle className="text-3xl text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold">
              About the Founder
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8 py-8">
            <div className="flex items-center gap-6 bg-slate-800/50 p-6 rounded-xl">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                {/* Name with Gradient Bar */}
                <div className="mb-2">
                  <div className="h-1 w-64 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-3 rounded-full"></div>
                  <h3 className="text-3xl font-bold text-white">
                    SIDDESH KUMAR
                  </h3>
                </div>
                <p className="text-gray-400 text-xl">Founder & CEO</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 group border border-slate-700">
                <Phone className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <a
                  href="tel:6380438353"
                  className="text-gray-300 hover:text-purple-400 transition-colors text-xl"
                >
                  6380438353
                </a>
              </div>

              <div className="flex items-center gap-4 p-5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 group border border-slate-700">
                <Mail className="h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <a
                  href="mailto:siddeshkumar.in@gmail.com"
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-xl"
                >
                  siddeshkumar.in@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700 space-y-4">
              <h4 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Our Mission
              </h4>
              <p className="text-gray-300 leading-relaxed text-lg">
                CollabHub was created to bridge the gap between students seeking collaboration
                and opportunities. We provide a platform where students can discover events,
                find mentors, join teams, and enhance their skills through curated courses
                and AI-powered recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
