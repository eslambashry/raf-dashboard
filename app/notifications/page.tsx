"use client"
import { useState, useEffect } from "react"
// import { io } from "socket.io-client"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/SidebarProvider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bell, Mail, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { set } from "date-fns"

interface EmailData {
  _id: string
  email: string
  createdAt: string
}

interface InterestedUser {
  _id: string
  fullName: string
  phone: number
  email: string
  categoryId: {
    title: string
    Image: { secure_url: string }
    location: string
  }
  unitId: {
    title: string
    type: string
    price: number
    images: { secure_url: string }[]
    status: string
  }
}
interface ConsultationUser {
  _id: string
  type: string
  selectedDay: string
  phone: string
  email:string
  status: string
}

export default function NotificationsPage() {
  const [subscriptions, setSubscriptions] = useState<EmailData[]>([])
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([])
  const [consultationsUser, setconsultationsUser] = useState<ConsultationUser[]>([])

  useEffect(() => {
    fetchData()

    // const socket = io("http://localhost:8080", {
    //   reconnection: true,
    //   timeout: 10000
    // })
    // socket.on("last-one-hour-consoltation", fetchData)
    // socket.on("last-one-hour-newsletter", fetchData)
    // socket.on("last-one-hour-intersted", fetchData)

    // return () => {
    //   socket.disconnect()
    // }
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [emailResponse, interestedResponse,consultaionsResponse] = await Promise.all([
        fetch("http://localhost:8080/newsletter/getAllLastHour", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/interested/getAllLastOneHour", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/consultation/getAllLastOneHour", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const emailData = await emailResponse.json()
      const interestedData = await interestedResponse.json()
      const consultaionsData = await consultaionsResponse.json()
      
      setSubscriptions(emailData.emailData || [])
      setInterestedUsers(interestedData.interstedData || [])
      setconsultationsUser(consultaionsData.consultationData|| [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setSubscriptions([])
      setInterestedUsers([])
      setconsultationsUser([]) // Add this line to reset consultations
    }
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header />
        <Sidebar />
        <main className="transition-all duration-300 ease-in-out pt-20 lg:pt-24 pr-0 lg:pr-64 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="emails">
              <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="emails">
                    <Mail className="mr-2 h-4 w-4" />
                    المشتركين ({subscriptions.length})
                  </TabsTrigger>
                  <TabsTrigger value="interested">
                    <User className="mr-2 h-4 w-4" />
                    المهتمين ({interestedUsers.length})
                  </TabsTrigger>
                  <TabsTrigger value="counsultations">
                    <User className="mr-2 h-4 w-4" />
                    الاستشارات ({consultationsUser.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="emails">
                  <Card className="shadow-lg">
                    <CardHeader className="border-b border-gray-100 bg-white/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-6 w-6 text-primary" />
                          <CardTitle className="text-2xl font-bold">المشتركين</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-100">
                        {subscriptions.map((sub) => (
                          <div key={sub._id} className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                            <div className="mr-4 flex-1">
                              <p className="font-medium text-gray-900">{sub.email}</p>
                              <span className="text-sm text-gray-500">
                                اشترك في: {new Date(sub.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="interested">
                  <Card className="shadow-lg">
                    <CardHeader className="border-b border-gray-100 bg-white/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <User className="h-6 w-6 text-primary" />
                          <CardTitle className="text-2xl font-bold">المهتمين</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-100">
                        {interestedUsers.map((user) => (
                          <div key={user._id} className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                            <div className="mr-4 flex-1">
                              <p className="font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-sm text-gray-600">هاتف: {user.phone}</p>
                              <div className="text-xs text-gray-500">
                                <p>الفئة: {user.categoryId?.title || 'غير محدد'}</p>
                                <p>الوحدة: {user.unitId?.title || 'غير محدد'}</p>
                                <p>السعر: {user.unitId?.price?.toLocaleString() || 0} ريال</p>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="counsultations">
                  <Card className="shadow-lg">
                    <CardHeader className="border-b border-gray-100 bg-white/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <User className="h-6 w-6 text-primary" />
                          <CardTitle className="text-2xl font-bold">الاستشارات</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-100">
                        {consultationsUser.map((cons) => (
                          <div key={cons._id} className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                            <div className="mr-4 flex-1">
                              <p className="font-medium text-gray-900">{cons.type}</p>
                              <p className="text-sm text-gray-600">{cons.email}</p>
                              <p className="text-sm text-gray-600">هاتف: {cons.phone}</p>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>اليوم: {cons.selectedDay}</p>
                                <p>الحالة: {cons.status}</p>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
