import { X } from 'lucide-react';
import { PanicButton } from '@/components/PanicButton';

interface PanicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAlert?: () => void;
}

export const PanicModal = ({ isOpen, onClose, onAlert }: PanicModalProps) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleAlert = () => {
        onAlert?.();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panic-modal-title"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="panic-modal-title" className="text-2xl font-bold text-foreground">
                        Emergency Alert
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                        aria-label="Close emergency alert modal"
                    >
                        <X className="h-6 w-6 text-foreground" />
                    </button>
                </div>
                <PanicButton onAlert={handleAlert} />
            </div>
        </div>
    );
};
