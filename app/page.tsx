import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Globe, MessageSquare, Shield, Sparkles, Zap, Users, Heart, Star } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
              S
            </div>
            <span className="text-2xl font-bold text-foreground">SwapSeva</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button variant="outline" className="font-medium">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Smart Skills Exchange for Modern India
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                    Connect with skilled professionals and exchange knowledge with AI-powered matching. Learn, teach, and grow together.
                  </p>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium text-sm">100% Free</span>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-sm">Skills Community</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="px-8 py-3 text-lg">
                      Start Learning <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                      How It Works
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-[400px] h-[400px] bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 shadow-2xl">
                  <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎓</div>
                      <div className="text-xl font-semibold text-card-foreground mb-2">Skills Exchange</div>
                      <div className="text-muted-foreground">Learn • Teach • Grow</div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Live Now!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-20 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-12 text-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Features for Skills Exchange
                </h2>
                <p className="max-w-[800px] text-muted-foreground text-lg md:text-xl">
                  SwapSeva makes learning and teaching skills simple, secure, and rewarding.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">Secure Learning</h3>
                  <p className="text-muted-foreground">
                    Verified profiles and trust scoring ensure safe skill exchanges with authentic learners.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">Smart Matching</h3>
                  <p className="text-muted-foreground">
                    AI algorithm connects you with perfect learning partners based on your interests and skills.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Globe className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">India-Wide Network</h3>
                  <p className="text-muted-foreground">
                    Connect with skilled professionals across India and expand your learning network.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">Learning Community</h3>
                  <p className="text-muted-foreground">
                    Join a supportive community of learners, teachers, and skill enthusiasts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-20 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    How Skills Exchange Works
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Start your learning journey with our simple 4-step process.
                  </p>
                </div>
                <ul className="grid gap-6">
                  <li className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                      1
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-card-foreground">Sign Up & Create Profile</h3>
                      <p className="text-muted-foreground">
                        Create your account and showcase your skills and learning interests.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                      2
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-card-foreground">List Skills to Teach & Learn</h3>
                      <p className="text-muted-foreground">Add what you can teach and what you want to learn.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                      3
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-card-foreground">Get Matched</h3>
                      <p className="text-muted-foreground">
                        Our AI finds perfect learning partners for skill exchange.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                      4
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-card-foreground">Learn & Teach</h3>
                      <p className="text-muted-foreground">
                        Connect with matches and start exchanging skills safely.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-[350px] h-[450px] bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 shadow-2xl">
                  <div className="w-full h-full bg-card rounded-2xl p-6 flex flex-col items-center justify-center">
                    <div className="text-center space-y-6">
                      <div className="text-5xl">�</div>
                      <div className="space-y-2">
                        <div className="text-xl font-semibold text-card-foreground">Popular Skills</div>
                        <div className="text-muted-foreground">Exchange knowledge</div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-muted rounded-lg p-3 text-sm">🎨 Graphic Design</div>
                        <div className="bg-muted rounded-lg p-3 text-sm">💻 Programming</div>
                        <div className="bg-muted rounded-lg p-3 text-sm">🎵 Music Lessons</div>
                        <div className="bg-muted rounded-lg p-3 text-sm">� Writing & Editing</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-20 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  Ready to Start Learning?
                </h2>
                <p className="max-w-[700px] text-primary-foreground/90 text-lg md:text-xl">
                  Join our community of learners and teachers. Exchange skills, grow together, and unlock your potential.
                </p>
                <div className="flex items-center justify-center gap-8 pt-4">
                  <div className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full">
                    <span className="font-medium">💯 100% Free Forever</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full">
                    <span className="font-medium">⚡ Setup in 2 Minutes</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full">
                    <span className="font-medium">� Completely Secure</span>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold">
                    Get Started Now <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/50 py-12">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              S
            </div>
            <span className="text-xl font-semibold text-foreground">SwapSeva</span>
          </div>
          <p className="text-center text-muted-foreground md:text-left">
            © 2025 SwapSeva. Connecting learners across India.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
