import { useQuery } from "@tanstack/react-query";
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

export default function AdminPage() {
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const { voteCounts } = useWebSocket();

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="max-w-6xl mx-auto space-y-8 py-8">
        <h1 className="text-3xl font-bold">Админ панель</h1>
        <Card>
          <CardHeader>
            <CardTitle>Результаты голосования</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {VOTE_OPTIONS.map((option) => (
                <div key={option.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{option.name}</h3>
                  <p className="text-2xl font-bold">{voteCounts[option.id] || 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Зарегестрированные пользователи</CardTitle>
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
