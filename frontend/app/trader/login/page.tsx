"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/ui/logo"
import { toast } from "sonner"
import { useTraderAuth } from "@/stores/auth"
import { traderApi } from "@/services/api"
import { Loader2, Mail, Lock } from "lucide-react"
import { useHydrated } from "@/hooks/use-hydrated"
import { Loading } from "@/components/ui/loading"

export default function TraderLoginPage() {
  const router = useRouter()
  const token = useTraderAuth((state) => state.token)
  const setToken = useTraderAuth((state) => state.setToken)
  const hydrated = useHydrated()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  
  useEffect(() => {
    if (hydrated && token) {
      router.push("/trader/deals")
    }
  }, [token, router, hydrated])
  
  if (!hydrated) {
    return <Loading fullScreen />
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error("Заполните все поля")
      return
    }
    
    setLoading(true)
    
    try {
      const response = await traderApi.login(formData.email, formData.password)
      
      if (response.token) {
        setToken(response.token)
        toast.success("Вход выполнен успешно")
        router.push("/trader/deals")
      } else {
        toast.error("Неверный ответ сервера")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error("Ошибка входа. Проверьте данные и попробуйте снова")
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            Вход в личный кабинет
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Введите ваши данные для входа в систему
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#006039] h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="trader@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Пароль
            </Label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#006039] h-4 w-4" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#006039] hover:bg-[#006039]/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Нет аккаунта?{" "}
            <a href="#" className="text-[#006039] hover:text-[#006039]/80 font-medium">
              Свяжитесь с администратором
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}