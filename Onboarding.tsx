import { useState } from 'react';
import { Shield, MapPin, Users, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingSlide {
    icon: React.ReactNode;
    title: string;
    description: string;
    highlight?: string;
}

const slides: OnboardingSlide[] = [
    {
        icon: <Shield className="h-20 w-20 text-red-600" />,
        title: 'Emergency Response',
        description: 'One tap to alert your community and emergency contacts. Get help when you need it most with our instant SOS panic button.',
        highlight: 'instant alerts',
    },
    {
        icon: <MapPin className="h-20 w-20 text-blue-600" />,
        title: 'Live Safety Map',
        description: 'See real-time incidents in your area. Stay informed about robberies, accidents, and emergencies happening around you.',
        highlight: 'real-time tracking',
    },
    {
        icon: <Users className="h-20 w-20 text-green-600" />,
        title: 'Community Safety',
        description: 'Join thousands of Namibians keeping each other safe. Share updates, help others, and build a safer community together.',
        highlight: 'community-driven',
    },
    {
        icon: <Bell className="h-20 w-20 text-purple-600" />,
        title: 'Look After Me',
        description: 'Plan your trips and let loved ones track your journey. Automatic alerts if you don\'t check in on time.',
        highlight: 'trip safety',
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onComplete();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const slide = slides[currentSlide];

    return (
        <div className="min-h-screen bg-white dark:bg-background flex flex-col">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-emergency rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">SafeGuard</span>
                </div>
                <button
                    onClick={onComplete}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted"
                >
                    Skip
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
                {/* Social Proof Card (only on first slide) */}
                {currentSlide === 0 && (
                    <div className="w-full max-w-md mb-12 bg-card rounded-2xl p-6 shadow-lg border border-border">
                        <p className="text-lg mb-3">
                            <span className="font-bold">Namibians</span>{' '}
                            <span className="text-green-600 font-bold">are using</span>{' '}
                            <span className="font-bold">SafeGuard</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Join the community keeping Namibia safe
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-background flex items-center justify-center text-white font-semibold"
                                    >
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-semibold">+1,000 active users</span>
                        </div>
                    </div>
                )}

                {/* Icon */}
                <div className="mb-8 animate-fade-in">
                    {slide.icon}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-center mb-6 max-w-md">
                    {slide.title.split(' ').map((word, i) => {
                        const isHighlight = slide.highlight && word.toLowerCase().includes(slide.highlight.split(' ')[0]);
                        return (
                            <span key={i}>
                                {isHighlight ? (
                                    <span className="text-primary">{word}</span>
                                ) : (
                                    word
                                )}{' '}
                            </span>
                        );
                    })}
                </h1>

                {/* Description */}
                <p className="text-center text-muted-foreground text-lg max-w-md mb-12">
                    {slide.description}
                </p>

                {/* Pagination Dots */}
                <div className="flex gap-2 mb-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentSlide
                                    ? 'w-8 bg-foreground'
                                    : 'w-2 bg-muted-foreground/30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="p-6 flex items-center justify-between gap-4">
                <Button
                    onClick={prevSlide}
                    variant="outline"
                    size="icon"
                    className="w-14 h-14 rounded-full"
                    disabled={currentSlide === 0}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                    onClick={nextSlide}
                    className="flex-1 h-14 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full"
                >
                    {currentSlide === slides.length - 1 ? 'Get started' : 'Continue'}
                </Button>

                <Button
                    onClick={nextSlide}
                    variant="outline"
                    size="icon"
                    className="w-14 h-14 rounded-full"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
};
