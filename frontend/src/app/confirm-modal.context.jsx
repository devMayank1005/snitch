import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import ConfirmModal from '../features/Shared/Components/ConfirmModal.jsx';

const ConfirmModalContext = createContext(null);

const DEFAULT_CONFIG = {
    title: 'Are you sure?',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmTone: 'danger',
};

export const ConfirmModalProvider = ({ children }) => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [isOpen, setIsOpen] = useState(false);
    const resolverRef = useRef(null);

    const closeModal = useCallback((result) => {
        setIsOpen(false);
        const resolve = resolverRef.current;
        resolverRef.current = null;
        if (resolve) resolve(result);
    }, []);

    const confirm = useCallback((nextConfig = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setConfig({ ...DEFAULT_CONFIG, ...nextConfig });
            setIsOpen(true);
        });
    }, []);

    return (
        <ConfirmModalContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                isOpen={isOpen}
                title={config.title}
                message={config.message}
                confirmLabel={config.confirmLabel}
                cancelLabel={config.cancelLabel}
                confirmTone={config.confirmTone}
                onConfirm={() => closeModal(true)}
                onCancel={() => closeModal(false)}
            />
        </ConfirmModalContext.Provider>
    );
};

export const useConfirmModal = () => {
    const context = useContext(ConfirmModalContext);
    if (!context) {
        throw new Error('useConfirmModal must be used within ConfirmModalProvider');
    }
    return context;
};
