import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
interface Toast { id: number; text: string; kind: 'success' | 'error'; }
const ToastContext = createContext<(text: string, kind?: 'success' | 'error') => void>(() => {});
let nextId = 1;
export function ToastProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Toast[]>([]);
    function notify(text: string, kind: 'success' | 'error' = 'success') {
        setItems(old => [...old, { id: nextId++, text, kind }].slice(-4));
    }
    function remove(id: number) { setItems(old => old.filter(item => item.id !== id)); }
    return <ToastContext.Provider value={notify}>{children}<div className="toast-stack" role="status" aria-live="polite">
        {items.map(item => <ToastItem key={item.id} item={item} onClose={() => remove(item.id)} />)}
    </div></ToastContext.Provider>;
}
function ToastItem({ item, onClose }: { item: Toast; onClose: () => void }) {
    useEffect(() => { const timer = window.setTimeout(onClose, 4500); return () => window.clearTimeout(timer); }, [onClose]);
    return <div className={`toast ${item.kind}`}>
        {item.kind === 'success' ? <CheckCircle2 size={19}/> : <AlertCircle size={19}/>}<span>{item.text}</span>
        <button type="button" className="icon-btn" aria-label="Bağla" onClick={onClose}><X size={16}/></button>
    </div>;
}
export const useToast = () => useContext(ToastContext);
