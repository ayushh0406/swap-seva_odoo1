"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Bell, Shield, User, Trash2, Save, Upload, Download, AlertTriangle, Check, X, Plus } from "lucide-react"
import { settingsAPI } from "@/lib/settings-api.js"

export default function SettingsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profilePhoto, setProfilePhoto] = useState<string>("")
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    skills: [] as string[]
  })
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    newMatches: true,
    messages: true,
    skillRequests: true
  })
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    showLocation: true,
    showEmail: false,
    showPhone: false
  })

  useEffect(() => {
    // Load user data from API
    const loadUserSettings = async () => {
      try {
        const response = await settingsAPI.getSettings();
        const { profile, notifications: apiNotifications, privacy: apiPrivacy } = response.data;
        
        setProfileData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          bio: profile.bio || "",
          location: profile.location || "",
          skills: profile.skills || []
        });
        
        setProfilePhoto(profile.profilePhoto || "");
        
        setNotifications({
          emailNotifications: apiNotifications?.emailNotifications ?? true,
          pushNotifications: apiNotifications?.pushNotifications ?? true,
          marketingEmails: apiNotifications?.marketingEmails ?? false,
          newMatches: apiNotifications?.newMatches ?? true,
          messages: apiNotifications?.messages ?? true,
          skillRequests: apiNotifications?.skillRequests ?? true
        });
        
        setPrivacy({
          profileVisibility: apiPrivacy?.profileVisibility ?? true,
          showLocation: apiPrivacy?.showLocation ?? true,
          showEmail: apiPrivacy?.showEmail ?? false,
          showPhone: apiPrivacy?.showPhone ?? false
        });
        
        // Also update localStorage for backward compatibility
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const updatedUser = { ...userData, ...profile };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to localStorage if API fails
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setProfilePhoto(userData.profilePhoto || "");
          setProfileData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            bio: userData.bio || "",
            location: userData.location || "",
            skills: userData.skills || []
          });
        }
        
        toast({
          title: "Connection issue",
          description: "Could not load settings from server. Using local data.",
          variant: "destructive"
        });
      }
    };

    loadUserSettings();
  }, [])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      })
      return
    }

    setUploadingPhoto(true)
    
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        
        try {
          // Upload to API
          const response = await settingsAPI.uploadPhoto(base64)
          
          setProfilePhoto(base64)
          
          // Update localStorage
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const userData = JSON.parse(storedUser)
            const updatedUser = { ...userData, profilePhoto: base64 }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            setUser(updatedUser)
          }
          
          toast({
            title: "Photo updated",
            description: "Your profile photo has been updated successfully."
          })
        } catch (error) {
          console.error('Upload error:', error)
          toast({
            title: "Upload failed",
            description: "Failed to upload photo. Please try again.",
            variant: "destructive"
          })
        } finally {
          setUploadingPhoto(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process photo. Please try again.",
        variant: "destructive"
      })
      setUploadingPhoto(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      })
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    const newSkills = profileData.skills.filter((_, i) => i !== index)
    setProfileData({...profileData, skills: newSkills})
  }

  const downloadUserData = () => {
    const userData = { user, profileData, notifications, privacy }
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'swapseva-user-data.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Data downloaded",
      description: "Your data has been downloaded successfully."
    })
  }

  const handleAccountDeletion = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear localStorage
      localStorage.removeItem("user")
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive"
      })
      
      // Redirect to home page
      window.location.href = "/"
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      // Validate required fields
      if (!profileData.name.trim() || !profileData.email.trim()) {
        toast({
          title: "Validation error",
          description: "Name and email are required fields.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(profileData.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update localStorage
      const updatedUser = { ...user, ...profileData, profilePhoto }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update localStorage
      const updatedUser = { ...user, notifications }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyUpdate = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update localStorage
      const updatedUser = { ...user, privacy }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-4 px-4 max-w-6xl">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
              <User className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
              <Bell className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
              <Shield className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24">
                      <AvatarImage src={profilePhoto || "/placeholder.svg?height=96&width=96"} alt="Profile" />
                      <AvatarFallback className="text-lg md:text-xl">
                        {profileData.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="gap-2 w-full sm:w-auto" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <>
                          <Upload className="h-4 w-4 animate-pulse" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Change Photo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center sm:text-left">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Make sure your profile information is accurate as it will be visible to other users when skills bartering.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {profileData.skills.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No skills added yet</p>
                    ) : (
                      profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 text-xs md:text-sm">
                          {skill}
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-1 hover:text-destructive transition-colors"
                            aria-label={`Remove ${skill} skill`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addSkill}
                      disabled={!newSkill.trim() || profileData.skills.includes(newSkill.trim())}
                      size="sm"
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add skills that you can offer or want to learn. This helps others find you for skill exchanges.
                  </p>
                </div>

                <Button onClick={handleProfileUpdate} disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, emailNotifications: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, pushNotifications: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Matches</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you have new skill matches
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newMatches}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, newMatches: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new messages
                      </p>
                    </div>
                    <Switch
                      checked={notifications.messages}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, messages: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Skill Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone requests your skills
                      </p>
                    </div>
                    <Switch
                      checked={notifications.skillRequests}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, skillRequests: checked})
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleNotificationUpdate} disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <Switch
                      checked={privacy.profileVisibility}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, profileVisibility: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Location</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your location to other users
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showLocation}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, showLocation: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your email address
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, showEmail: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Phone</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your phone number
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacy({...privacy, showPhone: checked})
                      }
                    />
                  </div>
                </div>

                <Button onClick={handlePrivacyUpdate} disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your account settings and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <h3 className="font-semibold text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      These actions cannot be undone. Please be careful.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Download Your Data</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Download a copy of all your data in JSON format
                        </p>
                      </div>
                      <Button variant="outline" onClick={downloadUserData} className="gap-2 text-xs md:text-sm">
                        <Download className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-destructive">Delete Account</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="gap-2 text-xs md:text-sm">
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Delete Account
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                All your skills, matches, messages, and profile information will be permanently lost.
                              </AlertDescription>
                            </Alert>
                          </div>
                          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setDeleteDialogOpen(false)}
                              className="w-full sm:w-auto"
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleAccountDeletion}
                              disabled={loading}
                              className="w-full sm:w-auto gap-2"
                            >
                              {loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  Delete Account
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}