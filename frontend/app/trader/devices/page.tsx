"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { traderApi } from "@/services/api";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Activity,
  Copy,
  Loader2,
  ChevronDown,
  X,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import QRCode from "qrcode";

interface Device {
  id: string;
  name: string;
  token: string;
  isOnline: boolean;
  isRegistered: boolean;
  energy?: number;
  ethernetSpeed?: number;
  lastSeen?: string;
  stoppedAt?: string;
  createdAt: string;
  linkedBankDetails: number;
  status?: "working" | "stopped" | "unregistered";
}

// Mock devices with more realistic data
const mockDevices: Device[] = [
  {
    id: "195088",
    name: "9090",
    token: "9d309ffc-2b7d-412d-ace7-d0f21841ba4d",
    isOnline: true,
    isRegistered: true,
    linkedBankDetails: 0,
    status: "stopped",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "193893",
    name: "ВТБ счет",
    token: "6884a2e4-aa34-4057-9ba8-48c11ce19893",
    isOnline: true,
    isRegistered: true,
    linkedBankDetails: 1,
    status: "stopped",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "193235",
    name: "Тинь июль",
    token: "0f440ced-4040-422d-8e39-49a012cc651c",
    isOnline: false,
    isRegistered: true,
    linkedBankDetails: 1,
    status: "stopped",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "192175",
    name: "34к35",
    token: "00aa2a8e-c694-40fa-96e8-0b12bf0a4a1b",
    isOnline: false,
    isRegistered: false,
    linkedBankDetails: 0,
    status: "unregistered",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "192127",
    name: "45",
    token: "53f8c0bd-5f4f-4ba2-be83-71d833c68f2e",
    isOnline: false,
    isRegistered: false,
    linkedBankDetails: 0,
    status: "unregistered",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "191473",
    name: "123",
    token: "c2d63d55-434b-45a5-b43c-c98b7d2ab87f",
    isOnline: false,
    isRegistered: false,
    linkedBankDetails: 0,
    status: "unregistered",
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "185726",
    name: "Тинь эльд 2",
    token: "5f779d3c-7163-424e-ac7e-97f5924af501",
    isOnline: false,
    isRegistered: true,
    linkedBankDetails: 1,
    status: "stopped",
    stoppedAt: "26.06.25, 12:45",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [deviceTokenDialogOpen, setDeviceTokenDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceForm, setDeviceForm] = useState({ name: "" });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      console.log("Fetching devices from API...");
      const response = await traderApi.getDevices();
      console.log("Devices API response:", response);

      // Map the API response to our Device interface
      const mappedDevices: Device[] = response.map((device: any) => ({
        id: device.id,
        name: device.name,
        token: device.token,
        isOnline: device.isOnline || false,
        isRegistered: true, // Assume all devices from API are registered
        energy: device.energy,
        ethernetSpeed: device.ethernetSpeed,
        lastSeen: device.lastSeen || device.createdAt,
        createdAt: device.createdAt,
        linkedBankDetails: device.linkedBankDetails || 0,
        status: device.isOnline ? "working" : "stopped",
      }));

      setDevices(mappedDevices);
      console.log("Devices loaded:", mappedDevices);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      toast.error("Не удалось загрузить устройства");
      // Fallback to mock devices if API fails
      setDevices(mockDevices);
    } finally {
      setLoading(false);
    }
  };

  const createDevice = async () => {
    try {
      const newDevice: Device = {
        id: Date.now().toString(),
        name: deviceForm.name,
        token: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isOnline: false,
        isRegistered: false,
        linkedBankDetails: 0,
        status: "unregistered",
        createdAt: new Date().toISOString(),
      };

      setDevices([newDevice, ...devices]);
      setDeviceDialogOpen(false);
      setDeviceForm({ name: "" });
      setSelectedDevice(newDevice);

      // Generate QR code for the token
      try {
        const qrCodeUrl = await QRCode.toDataURL(newDevice.token, {
          errorCorrectionLevel: "M",
          type: "image/png",
          quality: 0.92,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(qrCodeUrl);
      } catch (qrError) {
        console.error("Error generating QR code:", qrError);
      }

      setDeviceTokenDialogOpen(true);
      toast.success("Устройство создано");
    } catch (error) {
      console.error("Error creating device:", error);
      toast.error("Не удалось создать устройство");
    }
  };

  const filteredDevices = devices.filter((device) => {
    return (
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.token.includes(searchQuery) ||
      device.id.includes(searchQuery)
    );
  });

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  const getDeviceStatusInfo = (device: Device) => {
    if (!device.isRegistered) {
      return {
        title: "Не зарегистрировано в системе",
        description: "Пройдите регистрацию в мобильном приложении",
        badge: {
          text: "Без регистрации",
          className: "bg-red-50 text-red-600 border-red-200",
        },
        iconColor: "text-red-500",
      };
    }

    return {
      title: `Реквизиты: ${device.linkedBankDetails}`,
      description: device.stoppedAt
        ? `Остановлено: ${device.stoppedAt}`
        : "Остановлено",
      badge: {
        text: "Не в работе",
        className: "bg-orange-50 text-orange-600 border-orange-200",
      },
      iconColor: "text-orange-500",
    };
  };

  if (loading) {
    return (
      <ProtectedRoute variant="trader">
        <AuthLayout variant="trader">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#006039]" />
          </div>
        </AuthLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute variant="trader">
      <AuthLayout variant="trader">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Устройства</h1>
            <Button
              onClick={() => setDeviceDialogOpen(true)}
              style={{ backgroundColor: "#006039", color: "white" }}
              className="hover:opacity-90 transition-opacity"
            >
              <Wifi className="mr-2 h-5 w-5" />
              Добавить устройство
            </Button>
          </div>

          {/* Search and Filters Section */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Search Title */}
              <h3 className="text-lg font-medium">Поиск по устройствам</h3>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Искать устройства"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery("")}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-4">
                {/* Parameters Button */}
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <SlidersHorizontal className="mr-2 h-4 w-4 text-green-700" />
                      <span className="text-gray-500">Не выбраны</span>
                      <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Параметры поиска</h4>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Wifi className="h-4 w-4 text-green-700" />
                          <span>Статус устройств:</span>
                        </div>
                        <Select
                          defaultValue="all"
                          onValueChange={(value) => console.log(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Все устройства" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все устройства</SelectItem>
                            <SelectItem value="not_working">
                              Не в работе
                            </SelectItem>
                            <SelectItem value="working">В работе</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox />
                        <span className="text-sm">
                          Только активные устройства (online)
                        </span>
                      </label>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" size="sm">
                          Сбросить все
                        </Button>
                        <Button
                          className="flex-1 bg-green-700 hover:bg-green-700/90"
                          size="sm"
                        >
                          Применить фильтры
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <ArrowUpDown className="mr-2 h-4 w-4 text-green-700" />
                      {sortBy === "newest" ? "Сначала новые" : "Сначала старые"}
                      <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      Сначала новые
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                      Сначала старые
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>

          {/* Devices List */}
          <div className="space-y-3">
            {sortedDevices.map((device) => {
              const statusInfo = getDeviceStatusInfo(device);

              return (
                <Card
                  key={device.id}
                  className={cn(
                    "p-6 hover:shadow-md transition-all cursor-pointer",
                    !device.isRegistered && "bg-red-50/30",
                  )}
                  onClick={() => router.push(`/trader/devices/${device.id}`)}
                >
                  <div className="flex items-center justify-between">
                    {/* Left Section - Icon and Device Info */}
                    <div className="flex items-center gap-4">
                      {/* Device Icon */}
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          device.isRegistered ? "bg-orange-100" : "bg-red-100",
                        )}
                      >
                        <Smartphone
                          className={cn("h-6 w-6", statusInfo.iconColor)}
                        />
                      </div>

                      {/* Device Name and Token */}
                      <div>
                        <h3 className="font-semibold text-lg">{device.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500 font-mono">
                            {device.token.substring(0, 10)}...
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(device.token);
                              toast.success("Токен скопирован");
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Status */}
                    <div className="flex-1 px-8">
                      <div className="max-w-sm">
                        <p className="font-medium">{statusInfo.title}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {statusInfo.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Section - Online Status and Badge */}
                    <div className="flex items-center gap-6">
                      <div className="text-right w-24">
                        <p className="text-sm text-gray-500">Нет данных</p>
                        <p
                          className={cn(
                            "text-sm font-medium mt-1",
                            device.isOnline
                              ? "text-[#006039]"
                              : "text-gray-600",
                          )}
                        >
                          {device.isOnline ? "Онлайн" : "Не в сети"}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="w-32">
                        <Badge
                          className={cn(
                            "border px-3 py-1.5 rounded-md w-full text-center justify-center",
                            statusInfo.badge.className,
                          )}
                        >
                          {statusInfo.badge.text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {sortedDevices.length === 0 && (
            <Card className="p-12 text-center">
              <Smartphone className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Устройства не найдены</p>
            </Card>
          )}
        </div>

        {/* Create Device Dialog */}
        <Dialog open={deviceDialogOpen} onOpenChange={setDeviceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить устройство</DialogTitle>
              <DialogDescription>
                Введите название для нового устройства
              </DialogDescription>
            </DialogHeader>

            <div>
              <Label htmlFor="deviceName">Название устройства</Label>
              <Input
                id="deviceName"
                placeholder="Например: Samsung Galaxy S23"
                value={deviceForm.name}
                onChange={(e) => setDeviceForm({ name: e.target.value })}
                className="mt-2"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeviceDialogOpen(false);
                  setDeviceForm({ name: "" });
                }}
              >
                Отмена
              </Button>
              <Button
                onClick={createDevice}
                style={{ backgroundColor: "#006039", color: "white" }}
                className="hover:opacity-90 transition-opacity"
                disabled={!deviceForm.name}
              >
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Device Token Dialog */}
        <Dialog
          open={deviceTokenDialogOpen}
          onOpenChange={setDeviceTokenDialogOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Токен устройства</DialogTitle>
              <DialogDescription>
                Сохраните этот токен в безопасном месте. Он понадобится для
                подключения устройства.
              </DialogDescription>
            </DialogHeader>

            {selectedDevice && (
              <div className="space-y-6">
                {/* QR Code */}
                {qrCodeDataUrl && (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR код токена устройства"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Отсканируйте QR код с мобильного устройства
                    </p>
                  </div>
                )}

                {/* Token Text */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">
                    Токен устройства:
                  </p>
                  <p className="font-mono text-sm break-all">
                    {selectedDevice.token}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDevice.token);
                      toast.success("Токен скопирован в буфер обмена");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Скопировать
                  </Button>
                  <Button
                    className="flex-1 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white"
                    onClick={() =>
                      router.push(`/trader/devices/${selectedDevice.id}`)
                    }
                  >
                    Перейти к устройству
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeviceTokenDialogOpen(false)}
              >
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AuthLayout>
    </ProtectedRoute>
  );
}
