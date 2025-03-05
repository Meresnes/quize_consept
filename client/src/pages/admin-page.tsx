import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VOTE_OPTIONS } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {STATUS} from "@/types/status";
import {apiRequest} from "@/lib/queryClient";
import {toast} from "@/hooks/use-toast";

export default function AdminPage() {
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });
  const queryClient = useQueryClient();
  const [appStatus, setAppStatus] = useState<string>(STATUS.CLOSED);
  const { voteCounts } = useWebSocket();

  const { data: initialStatus } = useQuery({
    queryKey: ["/api/registration-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/registration-status");

      const data = await res.json();
      return data.status;
    },
  });
  const { mutate: setStatusMutate } = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("POST", "/api/registration-status", { status: newStatus });
      const data = await res.json();
      return data.status;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/registration-status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка установки стутса",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  useEffect(() => {
    if (initialStatus) {
      setAppStatus(initialStatus);
    }
  }, [initialStatus]);

  const toggleAppStatus = () => {
    const newStatus = appStatus === STATUS.OPEN ? STATUS.CLOSED : STATUS.OPEN;
    setStatusMutate(newStatus);
    setAppStatus(newStatus);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="max-w-6xl mx-auto space-y-8 py-8">
        <h1 className="text-3xl font-bold">Админ панель</h1>
        <Card>
          <CardHeader>
            <CardTitle>Включение\выключение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`flex items-center justify-center`}>
                <span className={`mr-4 font-bold ${appStatus === STATUS.OPEN ? "text-green-500" : "text-red-500"}`}>Статус: {appStatus === STATUS.OPEN ? "Открыт" : "Закрыт"}</span>
                <Button onClick={toggleAppStatus} className="bg-primary " variant="outline">
                  {appStatus === STATUS.OPEN ? "Закрыть доступ" : "Открыть доступ"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Результаты голосования</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {VOTE_OPTIONS.map((option) => (
                <div key={option.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{option.name}</h3>
                  <p className="text-2xl font-bold">{voteCounts[option.id]?.count || 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Зарегистрированные пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Проголосовал</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.hasVoted ? "Да" : "Нет"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
