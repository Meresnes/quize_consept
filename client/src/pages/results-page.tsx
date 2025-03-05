import { useWebSocket } from "@/hooks/use-websocket";
import { VOTE_OPTIONS, type User } from "@shared/schema";
import Drum from '../../public/assets/Drum.png';
import Guitar from '../../public/assets/Guitar.png';
import Music4 from '../../public/assets/Violin.png';
import Music2 from '../../public/assets/Piano.png';
import Music3 from '../../public/assets/Saxaphone.png';
import { useState, useEffect, useRef } from 'react';

const ICONS = {
    Music4,
    Guitar,
    Music2,
    Music3,
    Drum
};

type VoteData = {
    count: number;
    voters: User[];
};

type Cloud = {
    id: number;
    username: string;
    x: number;
    y: number;
    voteId: number;
};

export const VOTE_SHORT_TEXT = [
    { id: 1, name: "БЛАГОДАРНОСТЬ" },
    { id: 2, name: "ТЕИЛИМ" },
    { id: 3, name: "ЗАПОВЕДИ ПУРИМА" },
    { id: 4, name: "ШАББАТ" },
    { id: 5, name: "ХАСИДСКИЙ НИГУН" },
];

export default function ResultsPage() {
    const { voteCounts } = useWebSocket();
    const [clouds, setClouds] = useState<Cloud[]>([]);
    const prevVotersRef = useRef<Map<number, Set<string>>>(new Map());

    useEffect(() => {
        const newVoters = new Map<number, User[]>();

        Object.entries(voteCounts).forEach(([voteIdStr, data]: [string, VoteData]) => {
            const voteId = parseInt(voteIdStr);
            const prevVoters = prevVotersRef.current.get(voteId) || new Set();
            const currentVoters = new Set(data.voters.map(voter => voter.fullName));
            const newVoterNames = [...Array.from(currentVoters)].filter(name => !prevVoters.has(name));
            const newVoterObjects = data.voters.filter(voter => newVoterNames.includes(voter.fullName));

            if (newVoterObjects.length > 0) {
                newVoters.set(voteId, newVoterObjects);
            }

            prevVotersRef.current.set(voteId, currentVoters);
        });

        newVoters.forEach((voters, voteId) => {
            voters.forEach(voter => {
                const cloudId = Date.now() + Math.random();
                setClouds(prev => [...prev, {
                    id: cloudId,
                    username: voter.fullName,
                    x: Math.random() * 80 + 5,
                    y: Math.random() * 60 + 20,
                    voteId
                }]);

                setTimeout(() => {
                    setClouds(prev => prev.filter(cloud => cloud.id !== cloudId));
                }, 8000);
            });
        });
    }, [voteCounts]);

    return (
        <div
            className="min-h-screen max-w-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex justify-center items-center overflow-hidden relative"
            style={{
                background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))",
            }}
        >
            <div className="max-w-full w-full h-full">
                <div className="flex flex-row min-h-screen w-full py-40 relative">
                    {VOTE_OPTIONS.map((option, index) => {
                        const Icon = ICONS[option.icon as keyof typeof ICONS];
                        const voteData: VoteData = voteCounts[option.id] || { count: 0, voters: [] };
                        let count = voteData.count;

                        const minScale = 1;
                        const maxScale = 2.2;
                        const maxVotes = 80;
                        const scale = minScale + (maxScale - minScale) * Math.min(count / maxVotes, 1);
                        const isEven = index % 2 === 0;

                        return (
                            <div
                                key={option.id}
                                className={`relative flex flex-col items-center transition-all w-full text-center ${
                                    isEven ? "self-start" : "self-end"
                                }`}
                                style={{
                                    minHeight: "300px",
                                    paddingBottom: "5rem",
                                }}
                            >
                                <img
                                    src={Icon}
                                    className="object-contain transition-transform duration-300"
                                    style={{
                                        transform: `scale(${scale})`,
                                        maxHeight: "200px",
                                        marginBottom: `${scale * 52}px`,
                                    }}
                                />
                                <p className="mt-4 font-bold text-3xl text-pretty text-red-900">
                                    {VOTE_SHORT_TEXT[option.id - 1].name}
                                </p>
                                <p
                                    className="mt-2 text-xl text-black"
                                    style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)" }}
                                >
                                    Голосов: {count}
                                </p>
                            </div>
                        );
                    })}

                    {clouds.map(cloud => (
                        <div
                            key={cloud.id}
                            className="absolute animate-fly flex justify-center items-center border border-gray-200"
                            style={{
                                left: `${cloud.x}%`,
                                top: `${cloud.y}%`,
                                transform: 'translateX(-50%)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '12px 24px',
                                borderRadius: '25px',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                                fontSize: '1.1rem',
                                minWidth: '120px',
                            }}
                        >
                            <div className="text-2xl font-medium text-primary"
                                 style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)" }}
                            >
                                {cloud.username}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}