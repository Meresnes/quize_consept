import {Logo} from "@/components/Logo";

export default function ThankYouPage() {
    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex flex-col justify-center"
             style={{
                 background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))",
             }}
        >
            <div className="max-w-6xl mx-auto space-y-8 py-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-red-700">Спасибо за ваш голос!</h1>
                </div>
                <div className="max-w-6xl mx-auto space-y-8 py-8 flex items-center justify-center">
                    <Logo height={255}/>
                </div>
            </div>
        </div>
    );
}
