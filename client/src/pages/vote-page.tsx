import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { VOTE_OPTIONS } from "@shared/schema";
import { useLocation, useParams } from "wouter";
import { Loader2, Music, Music2, Music3, Music4, Guitar, Drum } from "lucide-react";
import { useState } from "react";

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
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/vote", {
        userId: parseInt(params.id!),
        optionIds: selectedOptions,
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
        title: "Ошибка голосвания",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleOption = (optionId: number) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-primary/2 via-primary/5 to-primary/2">
    {/*<div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">*/}
      <div className="max-w-6xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4 flex items-center justify-center flex-col">
          <Logo />
          <h1 className="text-3xl font-bold">Выберите хорошее дело</h1>
          <p className="text-muted-foreground">Вы можете выбрать сразу несколько</p>
        </div>

        <div className="grid md:grid-rows-3 lg:grid-rows-5 gap-8 font-bold">
          {VOTE_OPTIONS.map((option) => {
            const Icon = ICONS[option.icon as keyof typeof ICONS];
            const isSelected = selectedOptions.includes(option.id);

            return (
              <div
                key={option.id}
                className={`relative p-6 gap-4 h-max flex flex-row items-center cursor-pointer transition-all hover:scale-105 ${
                  isSelected ? 'ring-2 ring-primary rounded-lg' : ''
                }`}
                onClick={() => toggleOption(option.id)}
              >
                <Icon className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 min-w-[64px] md:min-w-[80px] transition-colors
                ${isSelected ? 'text-primary' : 'text-muted-foreground'}" />

                <h2 className="mt-4 text-lg md:text-xl text-left">{option.name}</h2>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full max-w-md mx-auto block bg-primary"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || selectedOptions.length === 0}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : "Проголосовать"}
        </Button>
      </div>
    </div>
  );
}