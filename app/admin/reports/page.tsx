"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  FileText, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  Clock,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface ReportPreview {
  summary: {
    totalNewUsers?: number
    totalActiveUsers?: number
    totalTrades?: number
    totalFeedbackMessages?: number
    dateRange: {
      start: string
      end: string
    }
  }
}

export default function AdminReports() {
  const [reportType, setReportType] = useState("user_activity")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [format, setFormat] = useState("json")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportPreview, setReportPreview] = useState<ReportPreview | null>(null)
  const { toast } = useToast()

  // Set default date range (last 30 days)
  useState(() => {
    const end = new Date()
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  })

  const generateReport = async (download = true) => {
    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select start and end dates",
        variant: "destructive",
      })
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Validation Error",
        description: "Start date cannot be after end date",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
        return
      }

      const params = new URLSearchParams({
        reportType,
        startDate,
        endDate,
        format: download ? format : 'json'
      })

      const response = await fetch(`http://localhost:3001/api/admin/reports?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate report")
      }

      if (download) {
        // Handle file download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `${reportType}-report.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: `Report downloaded successfully`,
        })
      } else {
        // Handle preview
        const data = await response.json()
        setReportPreview(data.data)
        toast({
          title: "Success",
          description: "Report preview generated",
        })
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'user_activity':
        return <Users className="h-5 w-5" />
      case 'swap_stats':
        return <TrendingUp className="h-5 w-5" />
      case 'feedback_logs':
        return <MessageSquare className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getReportDescription = (type: string) => {
    switch (type) {
      case 'user_activity':
        return "Comprehensive user report with all user details, swap history, skills, and profile information"
      case 'swap_stats':
        return "Detailed swap statistics with participant information, status tracking, and offering details"
      case 'feedback_logs':
        return "Complete feedback and communication logs from all user interactions and trades"
      default:
        return "Comprehensive platform analytics and insights"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download comprehensive platform reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="preview">Report Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select Report Type
              </CardTitle>
              <CardDescription>
                Choose the type of report you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    reportType === 'user_activity' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setReportType('user_activity')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">User Activity</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete user profiles with swap history, skills, and engagement metrics
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    reportType === 'swap_stats' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setReportType('swap_stats')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Swap Statistics</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detailed swap data with participants, offerings, and status tracking
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    reportType === 'feedback_logs' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setReportType('feedback_logs')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">Feedback Logs</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All user communications, feedback, and interaction logs
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>
                Configure the date range and format for your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-blue-700">
                  {getReportDescription(reportType)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button 
                  onClick={() => generateReport(false)}
                  disabled={isGenerating}
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating Preview...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Preview
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => generateReport(true)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Report Preview
              </CardTitle>
              <CardDescription>
                Preview of the generated report data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!reportPreview ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Generate a report preview to see the data here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportPreview.summary.totalNewUsers !== undefined && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <h3 className="font-medium">New Users</h3>
                        </div>
                        <p className="text-2xl font-bold">{reportPreview.summary.totalNewUsers}</p>
                      </div>
                    )}

                    {reportPreview.summary.totalActiveUsers !== undefined && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <h3 className="font-medium">Active Users</h3>
                        </div>
                        <p className="text-2xl font-bold">{reportPreview.summary.totalActiveUsers}</p>
                      </div>
                    )}

                    {reportPreview.summary.totalTrades !== undefined && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <h3 className="font-medium">Total Trades</h3>
                        </div>
                        <p className="text-2xl font-bold">{reportPreview.summary.totalTrades}</p>
                      </div>
                    )}

                    {reportPreview.summary.totalFeedbackMessages !== undefined && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-orange-500" />
                          <h3 className="font-medium">Feedback Messages</h3>
                        </div>
                        <p className="text-2xl font-bold">{reportPreview.summary.totalFeedbackMessages}</p>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Date Range</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>From: {new Date(reportPreview.summary.dateRange.start).toLocaleDateString()}</span>
                      <span>To: {new Date(reportPreview.summary.dateRange.end).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-700">
                      Report data is ready. Click "Download Report" to get the complete file.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 