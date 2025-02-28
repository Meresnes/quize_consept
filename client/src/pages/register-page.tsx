import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { InsertUser, insertUserSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

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

    const mutation = useMutation({
        mutationFn: async (data: InsertUser) => {
            const res = await apiRequest("POST", "/api/register", data);
            return res.json();
        },
        onSuccess: (data) => {
            setLocation(`/vote/${data.id}`);
        },
        onError: (error: Error) => {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <div className="min-h-screen max-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
             style={{
                 background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))",
             }}
        >
            <Card className="w-full md:max-w-md sm:border-primary max-sm:border-b-primary max-sm:border-t-primary max-sm:rounded-none shadow-xl h-[70vh] flex justify-center flex-col"

            >
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4 h-auto">
                        <Logo height={140}/>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">Пожайлуста заполните поля, чтобы продолжить</p>
                </CardHeader>
                <CardContent>
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
                                            <Input {...field} type="tel" className="border-primary" />
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
                </CardContent>
            </Card>
        </div>
    );
}