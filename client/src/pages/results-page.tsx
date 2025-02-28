import { useWebSocket } from "@/hooks/use-websocket";
import { VOTE_OPTIONS } from "@shared/schema";
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-40 items-start justify-between">
                    {VOTE_OPTIONS.map((option) => {
                        const Icon = ICONS[option.icon as keyof typeof ICONS];
                        let voteCount = voteCounts[option.id] || 0;

                        // 🔹 Устанавливаем масштабы
                        const minScale = 0.4; // Новый базовый размер (раньше было 0.8)
                        const maxScale = 2.5; // Максимальный размер увеличен
                        const scale = Math.max(
                            minScale,
                            Math.min(maxScale, minScale + Math.log(voteCount + 1) / Math.log(80) * (maxScale - minScale))
                        );

                        return (
                            <div
                                key={option.id}
                                className="relative flex flex-col items-center transition-all w-full min-h-[300px] text-center"
                            >
                                <img
                                    src={Icon}
                                    className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain transition-transform duration-300"
                                    style={{
                                        transform: `scale(${scale})`,
                                        marginBottom: `${scale * 4}rem`, // Динамический отступ
                                    }}
                                />
                                <p className="mt-4 font-bold text-lg md:text-xl lg:text-lg text-pretty "
                                >
                                    {option.name}
                                </p>
                                {/*TODO fix name on short version*/}
                                <p className="mt-2 text-sm md:text-base text-primary text-red-900"
                                   style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'}}
                                >
                                    Голосов: {voteCount}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}