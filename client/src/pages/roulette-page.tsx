import { useEffect, useState } from 'react';
import { VOTE_OPTIONS, type User } from "@shared/schema";
import Drum from '../../public/assets/Drum.png';
import Guitar from '../../public/assets/Guitar.png';
import Music4 from '../../public/assets/Violin.png';
import Music2 from '../../public/assets/Piano.png';
import Music3 from '../../public/assets/Saxaphone.png';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import Confetti from 'react-confetti';
import { VOTE_SHORT_TEXT } from "@/pages/results-page";
import { Logo } from "@/components/Logo.tsx";
import { VoteCountWithUsers } from "../../../server/storage.ts";

const ICONS = {
    Music4,
    Guitar,
    Music2,
    Music3,
    Drum
};

export default function RoulettePage() {
    const [currentVoteId, setCurrentVoteId] = useState(1);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showWinner, setShowWinner] = useState(false);
    const [winner, setWinner] = useState<User | null>(null);
    const [voteCounts, setVoteCounts] = useState<VoteCountWithUsers>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchVoteCounts = async () => {
            try {
                const response = await fetch('/api/votes');
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных о голосах');
                }
                const data = await response.json();
                setVoteCounts(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVoteCounts();
    }, []);

    const selectWinner = (voteId: number) => {
        setIsSpinning(true);
        setShowWinner(false);
        setWinner(null);

        setTimeout(() => {
            const voters = voteCounts[voteId]?.voters || [];
            if (voters.length > 0) {
                const randomIndex = Math.floor(Math.random() * voters.length);
                setWinner(voters[randomIndex]);
                setShowWinner(true);
            }
            setIsSpinning(false);
        }, 5000);
    };

    const onValueChange = (value: string) => {
        setCurrentVoteId(parseInt(value));
        setShowWinner(false);
        setWinner(null);
    };

    if (error) {
        return (
            <div className="min-h-screen h-screen flex justify-center items-center relative text-primary">
                <p>Произошла ошибка: {error.message}</p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen h-screen flex justify-center items-center relative"
            style={{
                background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))",
            }}
        >
            <div className="relative flex flex-col gap-20 bg-white rounded-lg shadow-lg p-8 border border-primary h-4/5 my-32 w-full mx-36 overflow-hidden">
                <div className="flex justify-center text-center mb-6">
                    <Logo height={140} />
                </div>

                <Tabs value={currentVoteId.toString()} onValueChange={onValueChange} className="h-full flex flex-col">
                    <TabsList className="flex justify-center gap-40 mb-8 w-full">
                        {VOTE_SHORT_TEXT.map((option) => (
                            <TabsTrigger
                                key={option.id}
                                value={option.id.toString()}
                                className="px-4 py-2 text-lg font-medium rounded-lg bg-primary/5 text-red-900 data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
                            >
                                {option.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Рендерим только активную вкладку */}
                    {VOTE_SHORT_TEXT.map((option) => (
                        option.id === currentVoteId && (
                            <TabsContent
                                key={option.id}
                                value={option.id.toString()}
                                className="text-center flex-1 flex flex-col"
                                forceMount={false} // Убедитесь, что неактивные вкладки не монтируются
                            >
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full flex-1">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
                                        <p className="ml-4 text-lg text-primary">Загрузка пользователей...</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto mb-6 relative">
                                        <ul className="max-w-md mx-auto">
                                            {voteCounts[option.id]?.voters.map((voter) => (
                                                <li
                                                    key={voter.id}
                                                    className="py-2 text-lg text-[#803226] border-b border-gray-200"
                                                >
                                                    {voter.fullName}
                                                </li>
                                            )) || <p className="text-muted-foreground">Никто ещё не проголосовал</p>}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-auto p-4">
                                    <button
                                        onClick={() => selectWinner(option.id)}
                                        disabled={isSpinning || !voteCounts[option.id]?.voters?.length}
                                        className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-amber-100 disabled:bg-gray-400 transition-all w-full"
                                    >
                                        Выбрать победителя
                                    </button>

                                    {isSpinning && (
                                        <div className="mt-6 relative max-h-[200px] overflow-hidden">
                                            <img
                                                src={ICONS[VOTE_OPTIONS.find(opt => opt.id === option.id)?.icon as keyof typeof ICONS]}
                                                className="mx-auto object-contain animate-spin"
                                                style={{ maxHeight: "150px" }}
                                            />
                                            <p className="mt-2 text-lg text-primary">Выбираем победителя...</p>
                                        </div>
                                    )}

                                    {showWinner && winner && (
                                        <div className="mt-6 relative max-h-[300px] overflow-hidden">
                                            <Confetti width={500} height={300} />
                                            <div className="p-6 bg-white rounded-lg shadow-lg border border-primary">
                                                <h2 className="text-3xl font-bold text-primary">
                                                    Победитель: {winner.fullName}
                                                </h2>
                                                <p className="mt-2 text-xl text-primary">
                                                    Номер телефона: {winner.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        )
                    ))}
                </Tabs>
            </div>
        </div>
    );
}