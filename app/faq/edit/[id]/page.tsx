"use client"

import { useReducer, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Loader2 } from "lucide-react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { faqSchema } from "@/lib/schemas"
import { toast } from "react-hot-toast"
import { useRouter, useParams } from 'next/navigation'
import type { z } from "zod"

type FormData = z.infer<typeof faqSchema>

type State = {
  keywords: { ar: string[]; en: string[] }
  newKeyword: { ar: string; en: string }
  isLoading: { ar: boolean; en: boolean }
  currentLang: "ar" | "en" | null
}

type Action =
  | { type: "SET_KEYWORDS"; lang: "ar" | "en"; value: string[] }
  | { type: "SET_NEW_KEYWORD"; lang: "ar" | "en"; value: string }
  | { type: "SET_LOADING"; lang: "ar" | "en"; value: boolean }
  | { type: "SET_LANGUAGE"; lang: "ar" | "en" }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_KEYWORDS":
      return { ...state, keywords: { ...state.keywords, [action.lang]: action.value } }
    case "SET_NEW_KEYWORD":
      return { ...state, newKeyword: { ...state.newKeyword, [action.lang]: action.value } }
    case "SET_LOADING":
      return { ...state, isLoading: { ...state.isLoading, [action.lang]: action.value } }
    case "SET_LANGUAGE":
      return { ...state, currentLang: action.lang }
    default:
      return state
  }
}

export default function EditFAQ() {
  const [state, dispatch] = useReducer(reducer, {
    keywords: { ar: [], en: [] },
    newKeyword: { ar: "", en: "" },
    isLoading: { ar: false, en: false },
    currentLang: null
  })

  const router = useRouter()
  const params = useParams()

  const forms = {
    ar: useForm<FormData>({ resolver: zodResolver(faqSchema), defaultValues: { lang: "ar" } }),
    en: useForm<FormData>({ resolver: zodResolver(faqSchema), defaultValues: { lang: "en" } }),
  }

  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        const response = await fetch(`https://raf-alpha.vercel.app/question/getOne/${params.id}`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch FAQ data');
        }

        const data = await response.json();
        console.log('Fetched Data:', data); // Debug log

        // Check if data exists and has the correct structure
        if (!data || !data.questionData) {
          throw new Error('Invalid data structure');
        }

        // Handle single object response
        if (!Array.isArray(data.questionData)) {
          const questionData = data.questionData;
          if (questionData.lang === 'ar') {
            forms.ar.setValue('question', questionData.question);
            forms.ar.setValue('answer', questionData.answer);
            dispatch({ type: "SET_KEYWORDS", lang: "ar", value: questionData.keywords || [] });
            dispatch({ type: "SET_LANGUAGE", lang: "ar" });
          } else if (questionData.lang === 'en') {
            forms.en.setValue('question', questionData.question);
            forms.en.setValue('answer', questionData.answer);
            dispatch({ type: "SET_KEYWORDS", lang: "en", value: questionData.keywords || [] });
            dispatch({ type: "SET_LANGUAGE", lang: "en" });
          }
          return;
        }

        // Handle array response
        const arData = data.questionData.find((q: any) => q.lang === 'ar');
        const enData = data.questionData.find((q: any) => q.lang === 'en');

        if (arData) {
          forms.ar.setValue('question', arData.question);
          forms.ar.setValue('answer', arData.answer);
          dispatch({ type: "SET_KEYWORDS", lang: "ar", value: arData.keywords || [] });
          dispatch({ type: "SET_LANGUAGE", lang: "ar" });
        }

        if (enData) {
          forms.en.setValue('question', enData.question);
          forms.en.setValue('answer', enData.answer);
          dispatch({ type: "SET_KEYWORDS", lang: "en", value: enData.keywords || [] });
          dispatch({ type: "SET_LANGUAGE", lang: "en" });
        }
      } catch (error) {
        console.error('Error fetching FAQ:', error);
        toast.error(error instanceof Error ? error.message : "Error fetching FAQ data");
      }
    };

    if (params.id) {
      fetchFAQData();
    }
  }, [params.id, forms.ar, forms.en]);

  const onSubmit = async (data: FormData, lang: "ar" | "en") => {
    dispatch({ type: "SET_LOADING", lang, value: true })
    try {
      // Sanitize the answer content before sending
      const sanitizedAnswer = data.answer
        .replace(/^<p>|<\/p>$/g, '')  // Remove wrapping <p> tags
        .trim();

      const requestData = {
        question: data.question.trim(),
        answer: sanitizedAnswer,
        keywords: state.keywords[lang],
        lang: lang
      }

      const response = await fetch(`https://raf-alpha.vercel.app/question/update/${params.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message)

      toast.success(lang === "ar" ? "تم تحديث السؤال بنجاح" : "FAQ updated successfully")
      router.push("/faq")
    } catch (error) {
      toast.error(lang === "ar" ? "حدث خطأ أثناء التحديث" : "Error updating FAQ")
      console.error(error)
    } finally {
      dispatch({ type: "SET_LOADING", lang, value: false })
    }
  }

  const Form = ({ lang, form, onSubmit, state }: {
    lang: "ar" | "en"
    form: ReturnType<typeof useForm<FormData>>
    onSubmit: (data: FormData, lang: "ar" | "en") => Promise<void>
    state: State
  }) => {
    const { register, formState: { errors }, watch, setValue, handleSubmit } = form

    return (
      <form onSubmit={handleSubmit((data: FormData) => onSubmit(data, lang))} className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {lang === "ar" ? "السؤال" : "Question"}
            </label>
            <Input
              {...register("question")}
              className={errors.question ? "border-red-500" : ""}
              dir={lang === "ar" ? "rtl" : "ltr"}
            />
            {errors.question && <p className="text-red-500 text-sm">{errors.question.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {lang === "ar" ? "الإجابة" : "Answer"}
            </label>
            <RichTextEditor
              content={watch("answer")?.replace(/<[^>]*>/g, '') || ""}
              onChange={(content) => setValue("answer", content.replace(/<[^>]*>/g, ''))}
              language={lang}
              
            />
            {errors.answer && <p className="text-red-500 text-sm">{errors.answer.message}</p>}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={state.isLoading[lang]}
            >
              {state.isLoading[lang] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {lang === "ar" ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                lang === "ar" ? "حفظ التغييرات" : "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    )
  }

  if (!state.currentLang) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle dir={state.currentLang === "ar" ? "rtl" : "ltr"}>
              {state.currentLang === "ar" ? "تعديل السؤال الشائع" : "Edit FAQ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.currentLang === "ar" ? (
              <Form lang="ar" form={forms.ar} onSubmit={onSubmit} state={state} />
            ) : (
              <Form lang="en" form={forms.en} onSubmit={onSubmit} state={state} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}