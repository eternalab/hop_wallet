import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './UI';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const isDanger = type === 'danger';

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-[320px] p-6 transform transition-all duration-200 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                        <AlertTriangle size={24} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
                    </div>

                    <div className="flex gap-3 w-full mt-2">
                        <Button variant="ghost" onClick={onCancel} className="flex-1">
                            {cancelText}
                        </Button>
                        <Button
                            variant={isDanger ? 'danger' : 'primary'}
                            onClick={onConfirm}
                            className="flex-1"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
