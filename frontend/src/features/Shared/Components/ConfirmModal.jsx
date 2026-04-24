import React from 'react';

const ConfirmModal = ({
    isOpen,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmTone = 'danger',
    isConfirming = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const confirmStyles =
        confirmTone === 'danger'
            ? 'bg-[#ba1a1a] text-white hover:bg-[#8b0000]'
            : 'bg-[#1b1c1a] text-[#fbf9f6] hover:bg-[#C9A96E] hover:text-[#1b1c1a]';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
            <div className="w-full max-w-md border border-[#e3d8c8] bg-[#fbf9f6] shadow-2xl">
                <div className="px-6 py-5 border-b border-[#eee6db]">
                    <p className="text-[10px] uppercase tracking-[0.24em] font-medium" style={{ color: '#C9A96E' }}>
                        Please confirm
                    </p>
                    <h2 className="mt-2 text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                        {title}
                    </h2>
                </div>

                <div className="px-6 py-5">
                    <p className="text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                        {message}
                    </p>

                    <div className="mt-6 flex items-center gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isConfirming}
                            className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] border border-[#d7ccbf] text-[#1b1c1a] hover:border-[#1b1c1a] transition-colors disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isConfirming}
                            className={`px-5 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors disabled:opacity-50 ${confirmStyles}`}
                        >
                            {isConfirming ? 'Working...' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
