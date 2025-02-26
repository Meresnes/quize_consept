import {Logo} from "@/components/Logo";

export default function ThankYouPage() {
    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex flex-col justify-center">
            <div className="max-w-6xl mx-auto space-y-8 py-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Спасибо за ваш голос!</h1>
                </div>
                <div className="max-w-6xl mx-auto space-y-8 py-8 flex items-center justify-center">
                    <Logo height={255}/>
                </div>
            </div>
        </div>
    );
}
