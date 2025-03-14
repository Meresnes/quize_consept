import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { VOTE_OPTIONS } from "@shared/schema";
import { useLocation, useParams } from "wouter";
import { Loader2 } from "lucide-react";
import Drum from '../../public/assets/Drum.png';
import Guitar from '../../public/assets/GuitarMini.png';
import Music4 from '../../public/assets/ViolinMini.png';
import Music2 from '../../public/assets/PianoMini.png';
import Music3 from '../../public/assets/SaxaphoneMini.png';
import { useState } from "react";
import {VOTE_SHORT_TEXT} from "@/pages/results-page";

const ICONS = {
  Music4,
  Guitar,
  Music2,
  Music3,
  Drum
};

export default function VotePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/vote", {
        userId: parseInt(params.id!),
        optionIds: [selectedOption],
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ваш голос учтён!",
        description: "Благодарим вас за участие в нашем опросе.",
      });
      setLocation("/thank-you");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка голосования",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOptionClick = (optionId: number) => {
    setSelectedOption(optionId);
  };

  const renderNameWithNoWrap = (name: string) => {
    const parts = name.split(" ");
    // @ts-ignore
    return parts.map((part, index) => (
        part.includes("-") ? (
            <span key={index} className="whitespace-nowrap">{part}</span>
        ) : (
            <span key={index}>{part}</span>
        )
    )).reduce((prev, curr) => [prev, " ", curr]);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary/2 via-primary/5 to-primary/2  "
           style={{
             background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))",
           }}
      >
        <div className="max-w-6xl mx-auto space-y-8 py-8 m-4 p-8">
          <div className="text-center space-y-4 flex items-center justify-center flex-col">
            <Logo />
            <h1 className="text-3xl text-red-700 font-bold">Выберите хорошее решение</h1>
            <p className="text-muted-foreground">Вы можете выбрать только один вариант</p>
          </div>

          <div className="grid md:grid-rows-3 lg:grid-rows-4 gap-8 font-bold">
            {VOTE_OPTIONS.map((option, index) => {
              const Icon = ICONS[option.icon as keyof typeof ICONS];
              const isSelected = selectedOption === option.id;

              return (
                  <div
                      key={option.id}
                      className={`relative p-6 h-max flex flex-col items-center cursor-pointer transition-all ${
                          isSelected ? 'scale-105 ring-2 ring-primary rounded-lg' : ''
                      }`}
                      onClick={() => handleOptionClick(option.id)}
                  >
                    <h3 className="text-red-700">
                      {VOTE_SHORT_TEXT[index].name}
                    </h3>
                    <div className="flex flex-row items-center gap-4">
                      <img
                          src={Icon}
                          className="ml-[-10px] w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                      />

                      <h2 className="mt-4 text-lg md:text-xl no-hyphens text-left ">
                        {renderNameWithNoWrap(option.name)}
                      </h2>
                    </div>
                  </div>
              );
            })}
          </div>

          <Button
              className="w-full max-w-md mx-auto block bg-primary"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || selectedOption === null}
          >
            {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : "Проголосовать"}
          </Button>
        </div>
      </div>
  );
}