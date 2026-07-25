'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/axios';
import {
  Search, ChevronRight, X, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, BarChart2, Calendar, Clock,
  AlertTriangle, CheckCircle2, List, Loader2,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyLogStats {
  cardsBought: number;
  cardsSold: number;
  trades: number;
  revenue: string;
  purchases: string;
  costOfCardsSold: string;
  expenses: string;
  profit: string;
  profitMargin: string;
  expectedEndingCash: string;
}

interface DailyLog {
  id: string;
  name: string;
  status: 'open' | 'closed';
  startingCash: string;
  updatedAfterClosing: boolean;
  createdAt: string;
  closedAt: string | null;
  stats: DailyLogStats;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt$(val: string | number | undefined) {
  const n = parseFloat(String(val ?? '0'));
  const abs = Math.abs(n);
  const formatted = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(2)}`;
  return n < 0 ? `-${formatted}` : formatted;
}

function parsePgDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  try {
    let cleaned = String(val).trim();
    if (cleaned.includes(' ') && !cleaned.includes('T')) {
      cleaned = cleaned.replace(' ', 'T');
    }
    cleaned = cleaned.replace(/([+-]\d{2})$/, '$1:00');
    let d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;

    const parts = cleaned.split(/[\sT]/);
    if (parts[0]) {
      d = new Date(parts[0]);
      if (!isNaN(d.getTime())) return d;
    }
  } catch (e) {}
  return null;
}

function fmtDate(val: any, includeTime = true) {
  const d = parsePgDate(val);
  if (!d) return '—';
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const date = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  if (!includeTime) return date;
  return `${date} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function fmtTime(val: any) {
  const d = parsePgDate(val);
  if (!d) return '—';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthName = months[d.getMonth()];
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${monthName} ${d.getDate()}, ${d.getFullYear()} · ${timeStr}`;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useDailyLogs() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<DailyLog[]>({
    queryKey: ['daily-logs', 'list', userId],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/daily-logs');
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 0,
  });
}

function useLogTransactions(logId: string | null) {
  return useQuery<any[]>({
    queryKey: ['daily-logs', 'transactions-all', logId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/v1/daily-logs/${logId}/transactions`);
      return data ?? [];
    },
    enabled: !!logId,
    staleTime: 0,
  });
}

// ─── Log Card ─────────────────────────────────────────────────────────────────

function LogCard({ log, onClick }: { log: DailyLog; onClick: () => void }) {
  const profit = parseFloat(log.stats?.profit ?? '0');
  const isOpen = log.status === 'open';

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center justify-between p-3.5 bg-[#0D0D0D] border border-[#252525] rounded-xl hover:border-[#3A3A3A] hover:bg-[#141414] transition-all group"
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md">{log.name}</span>
          {isOpen ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              OPEN
            </span>
          ) : (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              CLOSED
            </span>
          )}
          {log.updatedAfterClosing && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              UPDATED
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500">{fmtDate(log.createdAt, false)}</span>

      </div>

      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <div className={clsx(
            'text-sm font-bold',
            profit >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {profit >= 0 ? '+' : ''}{fmt$(profit)}
          </div>
          <div className="text-[10px] text-zinc-500">net profit</div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </button>
  );
}

// ─── Log Detail Slide-in ──────────────────────────────────────────────────────

function LogDetailPanel({ log, onClose }: { log: DailyLog; onClose: () => void }) {
  const { data: transactions, isLoading: txLoading } = useLogTransactions(log.id);
  const profit = parseFloat(log.stats?.profit ?? '0');

  const statCards = [
    { label: 'Starting Cash',      value: fmt$(log.startingCash),              icon: DollarSign,    color: 'text-zinc-300' },
    { label: 'Revenue',            value: fmt$(log.stats?.revenue),            icon: TrendingUp,    color: 'text-emerald-400' },
    { label: 'Purchases',          value: fmt$(log.stats?.purchases),          icon: ShoppingCart,  color: 'text-red-400' },
    { label: 'Cost of Cards Sold', value: fmt$(log.stats?.costOfCardsSold),    icon: BarChart2,     color: 'text-orange-400' },
    { label: 'Expenses',           value: fmt$(log.stats?.expenses),           icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Net Profit',         value: fmt$(log.stats?.profit),             icon: profit >= 0 ? TrendingUp : TrendingDown,
      color: profit >= 0 ? 'text-emerald-400' : 'text-red-400', highlight: true },
    { label: 'Margin',             value: `${parseFloat(log.stats?.profitMargin ?? '0').toFixed(1)}%`, icon: BarChart2, color: 'text-blue-400' },
    { label: 'Expected End Cash',  value: fmt$(log.stats?.expectedEndingCash), icon: DollarSign,    color: 'text-zinc-300' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative h-full w-full max-w-xl bg-[#0A0A0A] border-l border-[#252525] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-xl shrink-0',
              log.status === 'open'
                ? 'bg-emerald-500/15 border border-emerald-500/30'
                : 'bg-zinc-800 border border-zinc-700'
            )}>
              <List className={clsx('w-4 h-4', log.status === 'open' ? 'text-emerald-400' : 'text-zinc-400')} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate max-w-[260px]">{log.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={clsx(
                  'text-[10px] font-bold',
                  log.status === 'open' ? 'text-emerald-400' : 'text-zinc-500'
                )}>
                  {log.status.toUpperCase()}
                </span>
                {log.updatedAfterClosing && (
                  <span className="text-[10px] font-bold text-amber-400">· UPDATED AFTER CLOSE</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Meta */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#141414] border border-[#252525] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] text-zinc-500">Opened</span>
              </div>
              <span className="text-xs font-semibold text-white">{fmtDate(log.createdAt)}</span>
            </div>
            <div className="bg-[#141414] border border-[#252525] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] text-zinc-500">{log.closedAt ? 'Closed' : 'Status'}</span>
              </div>
              <span className="text-xs font-semibold text-white">
                {log.closedAt ? fmtDate(log.closedAt) : 'Still Open'}
              </span>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Financial Summary</p>
            <div className="grid grid-cols-2 gap-2">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className={clsx(
                    'rounded-xl p-3 border',
                    s.highlight
                      ? profit >= 0
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                      : 'bg-[#141414] border-[#252525]'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={clsx('w-3.5 h-3.5', s.color)} />
                    <span className="text-[10px] text-zinc-500">{s.label}</span>
                  </div>
                  <span className={clsx('text-sm font-bold', s.color)}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Counters */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Activity Counters</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Cards Bought', value: log.stats?.cardsBought ?? 0, color: 'text-red-400' },
                { label: 'Cards Sold',   value: log.stats?.cardsSold   ?? 0, color: 'text-emerald-400' },
                { label: 'Trades',       value: log.stats?.trades       ?? 0, color: 'text-blue-400' },
              ].map((c) => (
                <div key={c.label} className="bg-[#141414] border border-[#252525] rounded-xl p-3 text-center">
                  <div className={clsx('text-xl font-black', c.color)}>{c.value}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Feed */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Transaction Feed</p>

            {txLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-[#E8001C] animate-spin" />
              </div>
            ) : !transactions?.length ? (
              <div className="flex items-center justify-center py-8 rounded-xl bg-[#141414] border border-[#252525]">
                <span className="text-sm text-zinc-500">No transactions in this log.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx: any) => {
                  const isExpense = tx.type === 'expense';
                  const isSell    = tx.type === 'sell';
                  const isTrade   = tx.type === 'trade';
                  const isBuy     = tx.type === 'buy';

                  const sign = isExpense ? '-' : isSell ? '+' : isBuy ? '-' : '';
                  const numAmt = parseFloat(tx.amount || 0);

                  let formattedAmountStr = `${sign}${fmt$(tx.amount)}`;
                  if (isTrade) {
                    if (numAmt > 0) formattedAmountStr = `+${fmt$(numAmt)}`;
                    else if (numAmt < 0) formattedAmountStr = `-${fmt$(Math.abs(numAmt))}`;
                    else formattedAmountStr = 'Straight Trade';
                  }

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-[#141414] border border-[#252525] rounded-xl"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full border',
                            isExpense ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                            isSell    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                            isTrade   ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                                        'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          )}>
                            {isTrade ? 'TRADE' : tx.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-zinc-500">{fmtTime(tx.time)}</span>
                        </div>
                        <span className="text-sm font-medium text-white truncate">{tx.description || (isTrade ? 'Trade Transaction' : '—')}</span>
                      </div>
                      <span className={clsx(
                        'text-sm font-bold ml-3 shrink-0',
                        isSell || isTrade ? 'text-emerald-400' :
                        isExpense ? 'text-red-400' : 'text-zinc-300'
                      )}>
                        {formattedAmountStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyLogsPanel() {
  const { data: logs, isLoading } = useDailyLogs();
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  const filtered = useMemo(() => {
    if (!logs) return [];
    return logs.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));
  }, [logs, search]);

  const openLogs   = useMemo(() => filtered.filter((l) => l.status === 'open'),   [filtered]);
  const closedLogs = useMemo(() => filtered.filter((l) => l.status === 'closed'), [filtered]);

  return (
    <div className="bg-[#0D0D0D] border border-[#252525] rounded-2xl p-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8001C]/15 border border-[#E8001C]/30">
            <List className="w-4 h-4 text-[#E8001C]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Logs</h3>
            <p className="text-xs text-zinc-500">{logs?.length ?? 0} total sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {openLogs.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {openLogs.length} Open
            </span>
          )}
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {closedLogs.length} Closed
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search logs by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#141414] border border-[#252525] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E8001C]/50"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#E8001C] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-500">No logs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Open Logs */}
          {openLogs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-2">
                Open ({openLogs.length})
              </p>
              <div className="space-y-2">
                {openLogs.map((log) => (
                  <LogCard key={log.id} log={log} onClick={() => setSelectedLog(log)} />
                ))}
              </div>
            </div>
          )}

          {/* Closed Logs */}
          {closedLogs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase mb-2">
                Closed ({closedLogs.length})
              </p>
              <div className="space-y-2">
                {closedLogs.map((log) => (
                  <LogCard key={log.id} log={log} onClick={() => setSelectedLog(log)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Slide-in Panel */}
      {selectedLog && (
        <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
