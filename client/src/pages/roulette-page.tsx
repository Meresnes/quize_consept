import { useEffect, useState } from 'react';
import { VOTE_OPTIONS, type User } from "@shared/schema";
import Drum from '../../public/assets/Drum.png';
import Guitar from '../../public/assets/Guitar.png';
import Music4 from '../../public/assets/Violin.png';
import Music2 from '../../public/assets/Piano.png';
import Music3 from '../../public/assets/Saxaphone.png';
import Note1 from '../../public/assets/Note1.svg';
import Note2 from '../../public/assets/Note2.svg';
import Note3 from '../../public/assets/Note3.svg';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { VOTE_SHORT_TEXT } from "@/pages/results-page";
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
    const [winner, setWinner] = useState<User | null>(null);
    const [voteCounts, setVoteCounts] = useState<VoteCountWithUsers>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [showWinner, setShowWinner] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

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
        setShowNotes(false);
        setWinner(null);

        setTimeout(() => {
            const voters = voteCounts[voteId]?.voters || [];
            if (voters.length > 0) {
                const randomIndex = Math.floor(Math.random() * voters.length);
                setWinner(voters[randomIndex]);
                setShowWinner(true);
                setAnimationKey(prev => prev + 1);
            }
            setIsSpinning(false);
        }, 4000);
    };

    useEffect(() => {
        if (showWinner) {
            setShowNotes(true);
            const timer = setTimeout(() => setShowNotes(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [showWinner]);

    const onValueChange = (value: string) => {
        setCurrentVoteId(parseInt(value));
        setShowWinner(false);
        setWinner(null);
    };

    const notes = [
        `url(${Note1})`,
        `url(${Note2})`,
        `url(${Note3})`,
    ];

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center relative text-primary">
                <p>Произошла ошибка: {error.message}</p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen h-screen flex flex-col justify-center items-center relative p-20 overflow-hidden"
            style={{
                background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))",
            }}
        >
            <Tabs value={currentVoteId.toString()} onValueChange={onValueChange} className="h-full flex flex-col max-w-7xl">
                <TabsList className="flex justify-center gap-8 mb-8 w-full">
                    {VOTE_SHORT_TEXT.map((option) => {
                        const voteOption = VOTE_OPTIONS.find(opt => opt.id === option.id);
                        const Icon = voteOption ? ICONS[voteOption.icon as keyof typeof ICONS] : null;

                        return (
                            <TabsTrigger
                                key={option.id}
                                value={option.id.toString()}
                                disabled={isSpinning}
                                className={`flex flex-col items-center justify-end px-4 py-2 text-2xl font-bold rounded-lg bg-primary/5 
                                text-red-700 data-[state=active]:bg-primary transition-all
                                ${currentVoteId === option.id ? 'scale-110' : ''}`}
                            >
                                {Icon && (
                                    <img
                                        src={Icon}
                                        alt={option.name}
                                        className="object-contain mb-2"
                                        style={{ maxHeight: "150px" }}
                                    />
                                )}
                                <span>{option.name}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {VOTE_SHORT_TEXT.map((option) => (
                    option.id === currentVoteId && (
                        <TabsContent
                            key={option.id}
                            value={option.id.toString()}
                            className="text-center flex-1 flex h-full gap-12 flex-col overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full flex-1">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
                                    <p className="ml-4 text-3xl text-primary">Загрузка пользователей...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col mb-6 h-full">
                                    {!isSpinning && !showWinner && !winner && (
                                        <div className="grid grid-cols-3 gap-4 h-full items-center overflow-auto px-4">
                                            {voteCounts[option.id]?.voters.map((voter) => (
                                                <div
                                                    key={voter.id}
                                                    className="py-2 text-2xl text-[#803226] border-b border-gray-200"
                                                >
                                                    {voter.fullName}
                                                </div>
                                            )) || (
                                                <p className="text-2xl text-muted-foreground col-span-3">
                                                    Никто ещё не проголосовал
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {isSpinning && (
                                        <div className="mt-6 relative max-h-full m-10">
                                            <img
                                                src={ICONS[VOTE_OPTIONS.find(opt => opt.id === option.id)?.icon as keyof typeof ICONS]}
                                                className="mx-auto object-contain animate-spin"
                                                style={{ maxHeight: "350px" }}
                                            />
                                            <p className="my-2 text-5xl text-[#803226]">Выбираем победителя...</p>
                                        </div>
                                    )}

                                    <div className="p-10">
                                        {!isSpinning && !showWinner && !winner && (
                                            <button
                                                onClick={() => selectWinner(option.id)}
                                                disabled={isSpinning || !voteCounts[option.id]?.voters?.length}
                                                className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-amber-100 text-3xl disabled:bg-gray-400 transition-all w-full"
                                            >
                                                Выбрать победителя
                                            </button>
                                        )}

                                        {showWinner && winner && (
                                            <div className="mt-6 relative max-h-full overflow-hidden">
                                                <div className="p-6 rounded-lg shadow-lg border border-primary">
                                                    <h2 className="text-5xl font-bold text-red-700">
                                                        Победитель: {winner.fullName}
                                                    </h2>
                                                    <p className="mt-4 text-3xl text-[#803226]">
                                                        Номер телефона: {winner.phone[0] === '+' ? winner.phone : `+${winner.phone}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    )
                ))}
            </Tabs>
            {showNotes && (
                <div className="falling-notes" key={`animation-${animationKey}`}>
                    {Array.from({ length: 150 }).map((_, i) => {
                        const randomNote = notes[Math.floor(Math.random() * notes.length)];
                        return (
                            <div
                                key={`${animationKey}-${i}`}
                                className="note"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 50 + 40}px`,
                                    height: `${Math.random() * 50 + 40}px`,
                                    background: `${randomNote} no-repeat center center`,
                                    backgroundSize: 'contain',
                                    animationDuration: `${Math.random() * 3 + 2}s`,
                                    animationDelay: `${Math.random() * 2}s`,
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}