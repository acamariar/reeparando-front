import { useEffect, useMemo, useState } from "react";

type SelectOption = { value: string; label: string };
type SelectProps = {
    label: string;
    value?: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    error?: string;
    searchable?: boolean;
};

export function Select({ label, value, options, onChange, error, searchable = false }: SelectProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const current = options.find((o) => o.value === value);
        setQuery(current?.label ?? "");
    }, [value, options]);

    const filtered = useMemo(
        () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
        [options, query]
    );

    if (!searchable) {
        return (
            <label className="flex flex-col gap-1 text-slate-700">
                <span className="text-xs text-slate-500">{label}</span>
                <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primaryfocus:ring-2 focus:ring-blue-100"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Seleccione</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                {error ? <p className="text-xs text-red-500">{error}</p> : null}
            </label>
        );
    }

    return (
        <label className="flex flex-col gap-1 text-slate-700">
            <span className="text-xs text-slate-500">{label}</span>
            <div className="relative">
                <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                    value={query}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 100)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Seleccione o escriba…"
                />
                {open && filtered.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                        {filtered.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onChange(o.value);
                                    setQuery(o.label);
                                    setOpen(false);
                                }}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {error ? <p className="text-xs text-red-500">{error}</p> : null}
        </label>
    );
}
