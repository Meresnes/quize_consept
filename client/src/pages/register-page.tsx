import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form"; // Добавляем Controller
import { useLocation } from "wouter";
import { InsertUser, insertUserSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { IMaskInput } from "react-imask";
import { STATUS } from "@/types/status";

export default function RegisterPage() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    const form = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            fullName: "",
            phone: "",
        },
    });

    const { data: appStatus = STATUS.OPEN } = useQuery({
        queryKey: ["/api/registration-status"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/registration-status");
            const data = await res.json();
            return data.status;
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertUser) => {
            console.log("Отправляемые данные:", data); // Для отладки
            const res = await apiRequest("POST", "/api/register", data);
            return res.json();
        },
        onSuccess: (data) => {
            setLocation(`/vote/${data.id}`);
        },
        onError: (error: Error) => {
            toast({
                title: "Ошибка регистрации",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <div
            className="min-h-screen max-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
            style={{
                background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))",
            }}
        >
            <Card className="w-full md:max-w-md sm:border-primary max-sm:border-b-primary max-sm:border-t-primary max-sm:rounded-none shadow-xl h-[70vh] flex justify-center flex-col">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4 h-auto">
                        <Logo height={140}/>
                    </div>
                    {appStatus === STATUS.OPEN && (<p className="text-center text-sm text-muted-foreground">Пожайлуста, заполните поля, чтобы продолжить</p>)}
                </CardHeader>
                <CardContent>
                    {appStatus === STATUS.OPEN ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ФИО</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="border-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Номер телефона</FormLabel>
                                            <FormControl>
                                                <Controller
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field: { onChange, value } }) => (
                                                        <IMaskInput
                                                            mask="+0(000)-000-0000"
                                                            value={value ? `+${value}`: undefined}
                                                            unmask={true}
                                                            onAccept={(value) => onChange(value)} // Обновляем значение
                                                            placeholder="+_(___)-___-____"
                                                            className="flex h-10 w-full rounded-md border border-primary bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/10"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Продолжить
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-red-700">Регистрация закрыта</h1>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}