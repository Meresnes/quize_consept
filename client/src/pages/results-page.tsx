import { useWebSocket } from "@/hooks/use-websocket";
import { VOTE_OPTIONS } from "@shared/schema";
import { Music2, Music3, Music4, Guitar, Drum } from "lucide-react";

const ICONS = {
  Music4,
  Guitar,
  Music2,
  Music3,
  Drum
};

export default function ResultsPage() {
  const { voteCounts } = useWebSocket();
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
  return (
    <div className="min-h-screen max-w-full p-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex justify-center items-center gap-1.5"
         style={{
           backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(../../public/assets/MusicBg.jpg)",
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}
    >
      <div className="max-w-full mx-auto py-8">
        {/*<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-80 items-center justify-items-center">*/}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-80 items-center justify-end">
          {VOTE_OPTIONS.map((option) => {
            const Icon = ICONS[option.icon as keyof typeof ICONS];
            const voteCount = voteCounts[option.id] || 0;
            const percentage = totalVotes ? (voteCount / totalVotes) * 100 : 0;
            const maxScale = 2; // Максимальный размер увеличения
            const minScale = 0.8; // Минимальный размер

            const scale = Math.max(
                minScale,
                Math.min(maxScale, minScale + Math.log(voteCount + 1) / Math.log(80) * (maxScale - minScale))
            );

            return (
              <div
                key={option.id}
                className="relative flex flex-col items-center transition-all p-4 w-full gap-20 "
                style={{
                  transform: `scale(${scale})`,
                  zIndex: Math.floor(percentage),
                }}
              >
                <Icon 
                  className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 text-primary transition-all"
                  style={{
                    transform: `scale(${scale})`,
                  }}
                />
                {/*<h3*/}
                {/*  className="mt-4 text-xl md:text-2xl lg:text-3xl font-bold text-center transition-all"*/}
                {/*  style={{*/}
                {/*    fontSize: `${1.5 * (scale / 3)}rem`,*/}
                {/*  }}*/}
                {/*>*/}
                {/*  {option.name}*/}
                {/*</h3>*/}
                <p className="mt-2 text-sm md:text-base text-muted-foreground text-center">
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