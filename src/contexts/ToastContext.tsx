
import {
    createContext,
    useContext,
    useState,
    type ReactNode
} from 'react';

import { CircleCheck, CircleX, X } from 'lucide-react';

type ToastKind = boolean | 'success' | 'error' | 'info' | 'warning';

type ToastMessage = {
    id: number;
    text: string;
    ok: boolean;
};

type ToastContextValue = {
    notify: (text: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<ToastMessage[]>([]);

    function notify(text: string, kind: ToastKind = true) {
        const id = Date.now() + Math.random();
        const ok = kind !== false && kind !== 'error' && kind !== 'warning';

        setMessages(previous => [
            ...previous.slice(-3),
            { id, text, ok }
        ]);

        window.setTimeout(() => {
            setMessages(previous => previous.filter(x => x.id !== id));
        }, 4500);
    }

    function remove(id: number) {
        setMessages(previous => previous.filter(x => x.id !== id));
    }

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}

            <div className="toast-area">
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`toast ${message.ok ? 'ok' : 'bad'}`}
                    >
                        {message.ok
                            ? <CircleCheck size={18}/>
                            : <CircleX size={18}/>
                        }

                        <span>{message.text}</span>

                        <button
                            type="button"
                            aria-label="Bağla"
                            onClick={() => remove(message.id)}
                        >
                            <X size={15}/>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('ToastProvider missing');
    }

    return context.notify;
}
