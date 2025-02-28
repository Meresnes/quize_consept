import { useWebSocket } from "@/hooks/use-websocket";
import { VOTE_OPTIONS, type User } from "@shared/schema";
import Drum from '../../public/assets/Drums2.png'
import Guitar from '../../public/assets/Guitar2.png'
import Music4 from '../../public/assets/Violin.png'
import Music2 from '../../public/assets/Piano2.png'
import Music3 from '../../public/assets/Saxaphone3.png'

const ICONS = {
    Music4,
    Guitar,
    Music2,
    Music3,
    Drum
};

// Добавим тип для данных о голосах, чтобы было проще работать
type VoteData = {
    count: number;
    voters: User[];
};

const VOTE_SHORT_TEXT = [
{ id: 1, name: "ХАСИДСКИЙ НИГУН" },
{ id: 2, name: "БЛАГОДАРНОСТЬ" },
{ id: 3, name: "ТЕИЛИМ"},
{ id: 4, name: "ЗАПОВЕДИ ПУРИМА"},
{ id: 5, name: "ШАББАТ" },
]

export default function ResultsPage() {
    const { voteCounts } = useWebSocket();

    return (
        <div
            className="min-h-screen max-w-full p-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex justify-center items-center"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(../../public/assets/MusicBg.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="max-w-screen-2xl w-full mx-auto mt-16">
                <div className="grid gap-y-20 gap-x-40 md:gap-x-60 grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                     style={{
                         gridTemplateRows: "repeat(auto-fit, minmax(300px, 1fr))",
                     }}
                >
                    {VOTE_OPTIONS.map((option, index) => {
                        const Icon = ICONS[option.icon as keyof typeof ICONS];
                        const voteData: VoteData = voteCounts[option.id] || { count: 0, voters: [] };
                        const count = voteData.count

                        const minScale = 0.4;
                        const maxScale = 2.5;
                        const scale = Math.max(
                            minScale,
                            Math.min(maxScale, minScale + Math.log(count + 1) / Math.log(80) * (maxScale - minScale))
                        );

                        // Определяем, на какой линии (четной или нечетной) находится элемент
                        const isEvenRow = Math.floor(index / 2) % 2 === 0;
                        const isFirstRow = index < 2;

                        return (
                            <div
                                key={option.id}
                                className={`relative flex flex-col items-center transition-all w-full min-h-[300px] text-center ${isFirstRow ? "" : isEvenRow ? "justify-self-end self-end" : "justify-self-start self-end"} `}
                                style={{
                                    gridRow: `span 1`, // Занимает 1 строку
                                    gridColumn: `span 1`,
                                }}
                            >
                                {option.id === 3 ? (
                                    <img
                                        src={Icon}
                                        className="w-15 h-15 object-contain transition-transform duration-300"
                                        style={{
                                            transform: `scale(${scale / 1.5})`,
                                            marginBottom: `${scale * 4}rem`,
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={Icon}
                                        className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain transition-transform duration-300"
                                        style={{
                                            transform: `scale(${scale})`,
                                            marginBottom: `${scale * 4}rem`,
                                        }}
                                    />
                                )}

                                <p className="mt-4 font-bold text-lg md:text-xl lg:text-lg text-pretty">
                                    {VOTE_SHORT_TEXT[option.id-1].name}
                                </p>
                                <p
                                    className="mt-2 text-sm md:text-base text-primary text-red-900"
                                    style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}
                                >
                                    Голосов: {count}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}