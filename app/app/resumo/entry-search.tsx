"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { currency } from "@/lib/tokens";
import { brDateLabel } from "@/lib/date";
import { searchEntries, type SearchedEntry } from "./actions";

export function EntrySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedEntry[] | null>(null);
  const [searching, setSearching] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const id = ++requestId.current;
    const timeout = setTimeout(async () => {
      try {
        const found = await searchEntries(trimmed);
        if (requestId.current === id) setResults(found);
      } finally {
        if (requestId.current === id) setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="mb-3.5">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink-soft"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar um lançamento (qualquer mês)"
          className="w-full rounded-2xl border border-brand-line bg-brand-card py-3 pl-9 pr-9 text-[14px] text-brand-ink outline-none focus:border-brand-ink"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink-soft"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {query.trim().length >= 2 && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-brand-line bg-brand-card">
          {searching ? (
            <p className="px-4 py-3.5 text-[13px] text-brand-ink-soft">Buscando...</p>
          ) : results && results.length > 0 ? (
            <div className="divide-y divide-brand-bg">
              {results.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/app/lancamento/${entry.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-brand-ink">
                      {entry.description}
                    </div>
                    <div className="text-xs text-brand-ink-soft">
                      {brDateLabel(entry.entry_date)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 whitespace-nowrap font-display text-[14px] font-bold text-brand-ink">
                    {entry.type === "receita" ? "+" : "-"}
                    {currency(entry.amount)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-4 py-3.5 text-[13px] text-brand-ink-soft">
              Nada encontrado com esse nome.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
