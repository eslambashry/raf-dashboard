"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import Link from "next/link"
import { Edit, Trash2, Home, MapPin, DollarSign } from "lucide-react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"


interface Unit {
  _id: string
  title: string
  location: string
  area: number
  description: string
  images: Array<{ secure_url: string }>
  coordinates: { latitude: number; longitude: number }
  price: number
  status: string
  type: string
  rooms: number
  bathrooms: number
  floor: number
  customId: string
  lang: string
}

export default function UnitsPage() {
  const params = useParams()
  const categoryId = params?.categoryId as string
  const router = useRouter()
  
  const [selectedLang, setSelectedLang] = useState<'ar' | 'en'>('ar')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  if (!categoryId) {
    return <div>Loading...</div>
  }
  const fetchData = async () => {
    try {
      let endpoint = '';
      
      // Select endpoint based on language
      if (selectedLang === 'ar') {
        endpoint = `https://raf-alpha.vercel.app/unit/getAllUnitByCategoryIdAR/${categoryId}`;
      } else if (selectedLang === 'en') {
        endpoint = `https://raf-alpha.vercel.app/unit/getAllUnitByCategoryIdEN/${categoryId}`;
      } else {
        endpoint = `https://raf-alpha.vercel.app/unit/getAllUnitByCategoryId/${categoryId}`;
      }

      const response = await axios.get(endpoint);
      setUnits(response.data.units);
    } catch (err) {
      setError("فشل في جلب البيانات");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryId, selectedLang]); // Add selectedLang as dependency


  const handleDelete = (id: string) => {
    setPropertyToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (propertyToDelete) {
      try {
        await axios.delete(`https://raf-alpha.vercel.app/unit/delete/${propertyToDelete}`)
        setUnits(prev => prev.filter(unit => unit._id !== propertyToDelete))
      } catch (err) {
        console.error("Error deleting unit:", err)
      }
    }
    setDeleteDialogOpen(false)
    setPropertyToDelete(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-secondary animate-spin"></div>
          </div>
          <div className="mt-4 text-center text-gray-600 font-medium">
            جاري التحميل...
          </div>
        </div>
      </div>
    )
  }
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>
  const filteredUnits = units.filter(unit => unit.lang === selectedLang)

  return (
       <div className="min-h-screen bg-gray-100">
        <Header />
        <Sidebar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center my-8 px-4">
  <div className="bg-card p-1 rounded-xl shadow-sm">
    <div className="flex gap-1">
      <Button
        variant={selectedLang === 'ar' ? "default" : "ghost"}
        onClick={() => setSelectedLang('ar')}
        className="rounded-lg px-6 transition-all duration-200 hover:scale-105"
      >
        <span className="font-medium">العربية</span>
      </Button>
      <Button
        variant={selectedLang === 'en' ? "default" : "ghost"}
        onClick={() => setSelectedLang('en')}
        className="rounded-lg px-6 transition-all duration-200 hover:scale-105"
      >
        <span className="font-medium">English</span>
      </Button>
    </div>
  </div>
  
  <Link href={`/category/${categoryId}/add`}>
    <Button className="bg-[#20284DE5] hover:bg-[#AA9554] text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 rounded-lg px-6 py-2">
      <span className="font-medium ">إضافة وحدة جديدة</span>
    </Button>
  </Link>
</div>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <Card
            key={unit._id}
            className="overflow-hidden cursor-pointer"
            onClick={() => router.push(`/category/${categoryId}/${unit._id}`)}
          >             
           <div className="relative">
                <img
                  src={unit.images[0].secure_url}
                  alt={unit.title}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded-full text-sm">
                  {unit.status}
                </span>
              </div>
              
              <CardHeader>
                <CardTitle>
                  <div className="flex flex-col space-y-1">
                    <span className="text-lg font-bold">{unit.title}</span>
                    <span className="text-sm text-gray-500">{unit.location}</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <Home className="w-4 h-4 ml-2" />
                    <span>المساحة: {unit.area} م²</span>
                  </div>

                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 ml-2" />
                    <span>السعر: {unit.price.toLocaleString()} ريال</span>
                  </div>
                  <div>
                    
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 ml-2" />
                    <span>الطابق: {unit.floor}</span>
                  </div>

                  <div className="flex gap-4">
                    <span>غرف: {unit.rooms}</span>
                    <span>حمامات: {unit.bathrooms}</span>
                  </div>
                </div>
                

                  <div className="flex justify-end gap-2">

       <Link href={`/category/${categoryId}/edit/${unit._id}`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent Card's onClick from firing
                    }}
                  >
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل
                  </Button>
                </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(unit._id)}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="تأكيد الحذف"
          description="هل أنت متأكد من حذف هذه الوحدة؟ لا يمكن التراجع عن هذا الإجراء."
        />
      </main>
    </div>
  )
}
