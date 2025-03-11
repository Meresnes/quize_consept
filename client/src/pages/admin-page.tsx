import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VOTE_OPTIONS, type User } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/types/status";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as XLSX from "xlsx";
import { VoteCountWithUsers } from "../../../server/storage";
import {VOTE_SHORT_TEXT} from "@/pages/results-page.tsx";

export default function AdminPage() {
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });
  const { data: voteCountsData, isLoading, isError } = useQuery({
    queryKey: ["/api/votes"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/votes");
      return await res.json() as VoteCountWithUsers;
    },
  });
  const queryClient = useQueryClient();
  const [appStatus, setAppStatus] = useState<string>(STATUS.CLOSED);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const { voteCounts } = useWebSocket();

  const { data: initialStatus } = useQuery({
    queryKey: ["/api/registration-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/registration-status");
      const data = await res.json();
      return data.status;
    },
  });

  const { mutate: clearMutation } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/clear");
      const data = await res.json();
      return data;
    },
    onSuccess: async (data) => {
      toast({
        title: "Пользователи и голоса были очищены",
        description: data.message,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка очистки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: setStatusMutate } = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("POST", "/api/registration-status", {
        status: newStatus,
      });
      const data = await res.json();
      return data.status;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/api/registration-status"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка установки стутса",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const handleOpenClearModal = () => {
    setIsClearModalOpen(true);
  };

  const clearUsers = () => {
    clearMutation();
  };

  const exportToExcel = () => {
    if (!users) return;

    const formattedUsers = users.map((user) => ({
      Имя: user.fullName,
      Телефон: user.phone.toString()[0] === "+" ? user.phone : `+${user.phone}`,
      // Проголосовал: user.hasVoted ? "Да" : "Нет",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const exportVotingResultsToExcel = () => {
    if (!voteCountsData) return;

    const maxVoters = Math.max(
        ...VOTE_OPTIONS.map((option) => voteCountsData[option.id]?.voters.length || 0)
    );
    const headers = VOTE_OPTIONS.map((option) => VOTE_SHORT_TEXT[option.id - 1].name);
    const data = Array.from({ length: maxVoters }, () => Array(VOTE_OPTIONS.length).fill(""));

    VOTE_OPTIONS.forEach((option, colIndex) => {
      const voters = voteCountsData[option.id]?.voters || [];
      voters.forEach((voter, rowIndex) => {
        if (rowIndex < maxVoters) {
          data[rowIndex][colIndex] = `${voter.fullName}\n ${voter.phone.toString()[0] === "+" ? voter.phone : `+${voter.phone}`}`;
        }
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Результаты голосования");
    XLSX.writeFile(workbook, "voting_results.xlsx");
  };

  const renderVotersTable = (voteId: number) => {
    if (!voteCountsData || !voteCountsData[voteId]) {
      return <p className="text-muted-foreground">Нет проголосовавших</p>;
    }

    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Телефон</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voteCountsData[voteId].voters.map((voter: User) => (
                <TableRow key={voter.id}>
                  <TableCell>{voter.fullName}</TableCell>
                  <TableCell>
                    {voter.phone.toString()[0] === "+" ? voter.phone : `+${voter.phone}`}
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
    );
  };

  return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-6xl mx-auto space-y-8 py-8">
          <h1 className="text-3xl font-bold">Админ панель</h1>
          <Card>
            <CardHeader>
              <CardTitle>Включение\выключение возможности регистрации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`flex items-center justify-center`}>
                <span
                    className={`mr-4 font-bold ${
                        appStatus === STATUS.OPEN ? "text-green-500" : "text-red-500"
                    }`}
                >
                  Статус регистрации: {appStatus === STATUS.OPEN ? "Открыт" : "Закрыт"}
                </span>
                  <Button onClick={toggleAppStatus} className="bg-primary" variant="outline">
                    {appStatus === STATUS.OPEN ? "Закрыть доступ" : "Открыть доступ"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Очистка пользователей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`flex items-center justify-center`}>
                <span className="mr-4 font-bold">
                  Очистить пользователей и результаты голосования
                </span>
                  <AlertDialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
                    <AlertDialogTrigger asChild>
                      <Button onClick={handleOpenClearModal} className="bg-red-600" variant="outline">
                        Очистить
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие безвозвратно удалит всех пользователей и их голоса.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                            className="hover:bg-primary"
                            onClick={() => setIsClearModalOpen(false)}
                        >
                          Отмена
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-800 hover:bg-red-600"
                            onClick={clearUsers}
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Результаты голосования</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button
                    onClick={exportVotingResultsToExcel}
                    disabled={isLoading || isError}
                    className="bg-primary"
                >
                  Экспорт в Excel
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {VOTE_OPTIONS.map((option) => (
                    <div key={option.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold">{option.name}</h3>
                      <p className="text-2xl font-bold">{voteCounts[option.id]?.count || 0}</p>
                      <div className="mt-4">{renderVotersTable(option.id)}</div>
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
              <div className="flex justify-end mb-4">
                <Button onClick={exportToExcel} className="bg-primary">
                  Экспорт в Excel
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Телефон</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>
                          {user.phone.toString()[0] === "+" ? user.phone : `+${user.phone}`}
                        </TableCell>
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