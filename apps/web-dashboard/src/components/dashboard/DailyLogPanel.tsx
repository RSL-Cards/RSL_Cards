'use client';


import { useActiveDailyLog, useCreateDailyLog, useCloseDailyLog, useAddExpense, useUpdateExpense, useDeleteExpense, useDailyLogTransactions } from '@/hooks/dashboard/useDailyLog';
import { Plus, X, DollarSign, Activity, Settings2, Trash2, List, AlertTriangle, CheckCircle2, Lock, Pencil } from 'lucide-react';
import clsx from 'clsx';
import React, { useState, useRef, Fragment } from 'react';

export default function DailyLogPanel() {
  const { data: activeLog, isLoading } = useActiveDailyLog();
  const createLog = useCreateDailyLog();
  const closeLog = useCloseDailyLog();
  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [isOpening, setIsOpening] = useState(false);
  const [newLogName, setNewLogName] = useState('');
  const [startingCash, setStartingCash] = useState('');

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState<string | null>(null);
  const [expenseErrorMsg, setExpenseErrorMsg] = useState<string | null>(null);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const isSubmittingExpense = useRef(false);

  const [isViewingTransactions, setIsViewingTransactions] = useState(false);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);

  // Expense edit state
  const [editingExpense, setEditingExpense] = useState<{ id: string; category: string; amount: string; note: string; logId?: string } | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  // Expense delete state
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const { data: txData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isTxLoading } = useDailyLogTransactions(isViewingTransactions ? activeLog?.id : undefined);


  if (isLoading) {
    return (
      <div className="bg-[#0D0D0D] rounded-2xl border border-[#252525] p-6 shadow-sm animate-pulse h-32">
        <div className="h-4 bg-[#1A1A1A] rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-[#141414] rounded w-full"></div>
      </div>
    );
  }

  const handleCreateLog = () => {
    if (!newLogName) return;
    createLog.mutate(
      {
        name: newLogName,
        startingCash: startingCash ? parseFloat(startingCash) : 0,
      },
      {
        onSuccess: () => {
          setIsOpening(false);
          setNewLogName('');
          setStartingCash('');
        }
      }
    );
  };

  const handleCloseLog = () => {
    if (!activeLog) return;
    setIsConfirmingClose(true);
  };

  const confirmClose = () => {
    if (!activeLog) return;
    closeLog.mutate(activeLog.id, {
      onSuccess: () => {
        setIsConfirmingClose(false);
      }
    });
  };

  const handleAddExpense = () => {
    if (!expenseCategory || !expenseAmount || isSubmittingExpense.current) return;

    const cat = expenseCategory;
    const amt = parseFloat(expenseAmount);
    const note = expenseNote;

    isSubmittingExpense.current = true;
    setExpenseSaving(true);
    setExpenseErrorMsg(null);
    setExpenseSuccessMsg(null);

    // Clear inputs immediately on click
    setExpenseCategory('');
    setExpenseAmount('');
    setExpenseNote('');

    addExpense.mutate(
      {
        category: cat,
        amount: amt,
        description: note || undefined,
        dailyLogId: activeLog?.id,
      },
      {
        onSuccess: () => {
          isSubmittingExpense.current = false;
          setExpenseSaving(false);
          setExpenseSuccessMsg(`$${amt.toFixed(2)} expense recorded — ${cat}`);
          // Auto-close form after showing success for 1.8s
          setTimeout(() => {
            setIsAddingExpense(false);
            setExpenseSuccessMsg(null);
            setIsViewingTransactions(true);
          }, 1800);
        },
        onError: (err: any) => {
          isSubmittingExpense.current = false;
          setExpenseSaving(false);
          // Restore values so they can fix and retry
          setExpenseCategory(cat);
          setExpenseAmount(amt.toString());
          setExpenseNote(note);
          setExpenseErrorMsg(err?.message || 'Failed to save expense. Please try again.');
        },
      }
    );
  };

  const handleCloseExpenseForm = () => {
    setIsAddingExpense(false);
    setExpenseCategory('');
    setExpenseAmount('');
    setExpenseNote('');
    setExpenseSuccessMsg(null);
    setExpenseErrorMsg(null);
    setExpenseSaving(false);
    isSubmittingExpense.current = false;
  };

  if (!activeLog) {
    return (
      <>
        <div className="bg-[#0D0D0D] rounded-2xl border border-[#252525] p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div>
              <span className="text-sm font-bold text-white">No Active Daily Log</span>
              <span className="text-xs text-zinc-500 block">Open a session to track show/shop purchases &amp; sales</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpening(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-4 py-2 text-xs font-bold text-white transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Open Daily Log
          </button>
        </div>

        {/* Open Daily Log Theme Modal */}
        {isOpening && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl sm:p-7 animate-in zoom-in-95 duration-200">
              
              {/* Top Close Button */}
              <button
                type="button"
                onClick={() => setIsOpening(false)}
                className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon & Title Header */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C] shrink-0">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Open Daily Log</h3>
                  <p className="text-xs text-zinc-400 font-medium">Create a session for a show or shop day</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Log Name <span className="text-[#E8001C]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Log Name (e.g., Dallas Card Show Day 1)"
                    value={newLogName}
                    onChange={(e) => setNewLogName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#141414] border border-[#252525] rounded-xl focus:outline-none focus:border-[#E8001C] text-white placeholder:text-zinc-500 font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Starting Cash ($) <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Starting Cash (e.g., 500)"
                    value={startingCash}
                    onChange={(e) => setStartingCash(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#141414] border border-[#252525] rounded-xl focus:outline-none focus:border-[#E8001C] text-white placeholder:text-zinc-500 font-mono font-medium"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Cash in till at start of show/day to calculate closing expected cash.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpening(false)}
                  className="flex-1 rounded-xl border border-[#252525] bg-[#141414] hover:bg-[#1E1E1E] px-4 py-3 text-xs font-bold text-zinc-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateLog}
                  disabled={createLog.isPending || !newLogName}
                  className="flex-1 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-4 py-3 text-xs font-bold text-white shadow-lg transition-all border border-[#E8001C]/50 disabled:opacity-50"
                >
                  {createLog.isPending ? 'Starting Log...' : 'Start Log'}
                </button>
              </div>

            </div>
          </div>
        )}
      </>
    );
  }

  if (activeLog) {
    return (
      <div className="bg-[#0D0D0D] rounded-2xl border border-[#252525] p-5 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#E8001C]"></div>

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                {activeLog.name}
              </h3>
              <span className="text-xs text-zinc-400">
                Started {new Date(activeLog.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsViewingTransactions(!isViewingTransactions);
                if (isAddingExpense) setIsAddingExpense(false);
              }}
              className={clsx(
                "text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border",
                isViewingTransactions
                  ? "bg-[#1A1A1A] border-[#333] text-white"
                  : "bg-[#141414] border-[#252525] text-zinc-300 hover:bg-[#1E1E1E]"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Transactions
            </button>
            <button
              onClick={() => {
                setIsAddingExpense(!isAddingExpense);
                if (isViewingTransactions) setIsViewingTransactions(false);
              }}
              className={clsx(
                "text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border",
                isAddingExpense
                  ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                  : "bg-[#141414] border-[#252525] text-zinc-300 hover:bg-[#1E1E1E]"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Expense
            </button>
            <button
              onClick={handleCloseLog}
              disabled={closeLog.isPending}
              className="text-xs font-medium px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 rounded-lg transition-colors"
            >
              {closeLog.isPending ? 'Closing...' : 'Close'}
            </button>
          </div>
        </div>

        {expenseSuccessMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs font-semibold text-emerald-400 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{expenseSuccessMsg}</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">ADDED TO SESSION</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#252525]">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Money In</span>
            <span className="text-sm font-bold text-emerald-400">
              ${activeLog.stats?.moneyIn || '0'}
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Money Out</span>
            <span className="text-sm font-bold text-red-400">
              ${activeLog.stats?.moneyOut || '0'}
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Expenses</span>
            <span className="text-sm font-bold text-orange-400">
              ${activeLog.stats?.expenses || '0'}
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Net Profit</span>
            <span className={clsx(
              "text-sm font-bold",
              parseFloat(activeLog.stats?.profit || '0') >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              ${activeLog.stats?.profit || '0'}
            </span>
          </div>
        </div>

        {/* Record Expense Inline Form */}
        {isAddingExpense && (
          <div className="mt-4 pt-4 border-t border-[#252525]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-semibold text-white">Record Expense</h4>
              </div>
              <button
                onClick={handleCloseExpenseForm}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Feedback */}
            {expenseSuccessMsg && (
              <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-400">{expenseSuccessMsg}</p>
                  <p className="text-[10px] text-emerald-500 mt-0.5">Added to session — closing form...</p>
                </div>
              </div>
            )}

            {/* Error Feedback */}
            {expenseErrorMsg && (
              <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-400">Failed to save expense</p>
                  <p className="text-[10px] text-red-400/70 mt-0.5">{expenseErrorMsg}</p>
                </div>
              </div>
            )}

            {/* Inputs — hidden during success animation */}
            {!expenseSuccessMsg && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Category (e.g. Travel, Supplies)"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    disabled={expenseSaving}
                    className="px-3 py-2 text-sm bg-[#141414] border border-[#252525] text-white placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-[#E8001C] disabled:opacity-50"
                  />
                  <input
                    type="number"
                    placeholder="Amount (e.g. 150)"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    disabled={expenseSaving}
                    className="px-3 py-2 text-sm bg-[#141414] border border-[#252525] text-white placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-[#E8001C] disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    disabled={expenseSaving}
                    className="px-3 py-2 text-sm bg-[#141414] border border-[#252525] text-white placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-[#E8001C] disabled:opacity-50"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCloseExpenseForm}
                    disabled={expenseSaving}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-[#141414] rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExpense}
                    disabled={!expenseCategory || !expenseAmount || expenseSaving}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#E8001C] hover:bg-[#CC0018] disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {expenseSaving ? (
                      <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                    ) : 'Save Expense'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* View Transactions Inline Modal */}
        {isViewingTransactions && (
          <div className="mt-4 pt-4 border-t border-[#252525]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <List className="w-4 h-4 text-[#E8001C]" />
                <h4 className="text-sm font-semibold text-white">Daily Transactions</h4>
              </div>
              <div className="text-xs text-zinc-400">
                Profit = Money In - (Money Out + Expenses)
              </div>
            </div>

            <div className="bg-[#141414] rounded-lg border border-[#252525] overflow-hidden">
              <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                {isTxLoading ? (
                  <div className="p-4 text-center text-xs text-zinc-400">Loading transactions...</div>
                ) : txData?.pages[0]?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400">No transactions recorded yet.</div>
                ) : (
                  <>
                    {txData?.pages.map((page, i) => (
                      <Fragment key={i}>
                        {page.map((tx: any) => (
                          <div key={tx.id} className="flex items-center justify-between p-2.5 bg-[#0D0D0D] border border-[#252525] rounded-lg shadow-sm group">
                            <div className="flex flex-col min-w-0 flex-1 mr-2">
                              <span className="text-sm font-medium text-white truncate">
                                {tx.description || 'Unknown'}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={clsx(
                                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                                tx.type === 'sell' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                                  tx.type === 'buy' ? "bg-red-500/15 text-red-400 border-red-500/30" :
                                    "bg-orange-500/15 text-orange-400 border-orange-500/30"
                              )}>
                                {tx.type.toUpperCase()}
                              </span>
                              <span className={clsx(
                                "text-sm font-bold w-20 text-right",
                                tx.type === 'sell' ? "text-emerald-400" :
                                  tx.type === 'buy' ? "text-red-400" :
                                    "text-orange-400"
                              )}>
                                {tx.type === 'sell' ? '+' : '-'}${parseFloat(tx.amount || 0).toFixed(2)}
                              </span>

                              {/* Edit/Delete — only for expense type */}
                              {tx.type === 'expense' && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => setEditingExpense({
                                      id: tx.id,
                                      category: tx.description?.split(' - ')[0] || '',
                                      amount: parseFloat(tx.amount || 0).toFixed(2),
                                      note: tx.description?.split(' - ').slice(1).join(' - ') || '',
                                      logId: activeLog?.id,
                                    })}
                                    className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                                    title="Edit expense"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingExpenseId(tx.id)}
                                    className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                    title="Delete expense"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </Fragment>
                    ))}
                    {hasNextPage && (
                      <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="w-full py-2 mt-2 text-xs font-medium text-[#E8001C] hover:bg-[#E8001C]/10 rounded transition-colors"
                      >
                        {isFetchingNextPage ? 'Loading more...' : 'Load older transactions'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Expense Modal */}
        {editingExpense && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#252525] bg-[#0D0D0D] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
              <button
                onClick={() => { setEditingExpense(null); setEditError(null); }}
                className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-xl border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Expense</h3>
                  <p className="text-[11px] text-zinc-400">Update category, amount or note</p>
                </div>
              </div>

              {editError && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{editError}</p>
                </div>
              )}

              <div className="space-y-2.5 mb-4">
                <input
                  type="text"
                  placeholder="Category"
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                  disabled={editSaving}
                  className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#252525] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                  disabled={editSaving}
                  className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#252525] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50 font-mono"
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={editingExpense.note}
                  onChange={(e) => setEditingExpense({ ...editingExpense, note: e.target.value })}
                  disabled={editSaving}
                  className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#252525] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingExpense(null); setEditError(null); }}
                  disabled={editSaving}
                  className="flex-1 rounded-xl border border-[#252525] bg-[#141414] hover:bg-[#1E1E1E] px-4 py-2.5 text-xs font-bold text-zinc-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!editingExpense.category || !editingExpense.amount) return;
                    setEditSaving(true);
                    setEditError(null);
                    updateExpense.mutate(
                      {
                        id: editingExpense.id,
                        data: {
                          category: editingExpense.category,
                          amount: parseFloat(editingExpense.amount),
                          description: editingExpense.note || undefined,
                        },
                        logId: editingExpense.logId,
                      },
                      {
                        onSuccess: () => { setEditSaving(false); setEditingExpense(null); setEditError(null); },
                        onError: (err: any) => { setEditSaving(false); setEditError(err?.message || 'Failed to update expense'); },
                      }
                    );
                  }}
                  disabled={!editingExpense.category || !editingExpense.amount || editSaving}
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-black disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {editSaving ? (
                    <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving...</>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Expense Confirm Modal */}
        {deletingExpenseId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-[#252525] bg-[#0D0D0D] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete Expense</h3>
                  <p className="text-[11px] text-zinc-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-xs text-zinc-300 mb-4">
                Are you sure you want to permanently delete this expense from the session?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeletingExpenseId(null)}
                  disabled={deleteExpense.isPending}
                  className="flex-1 rounded-xl border border-[#252525] bg-[#141414] hover:bg-[#1E1E1E] px-4 py-2.5 text-xs font-bold text-zinc-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteExpense.mutate(
                      { id: deletingExpenseId, logId: activeLog?.id },
                      {
                        onSuccess: () => setDeletingExpenseId(null),
                        onError: () => setDeletingExpenseId(null),
                      }
                    );
                  }}
                  disabled={deleteExpense.isPending}
                  className="flex-1 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deleteExpense.isPending ? (
                    <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Daily Log Theme Modal */}
        {isConfirmingClose && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl sm:p-7 animate-in zoom-in-95 duration-200">
              
              {/* Top Close Button */}
              <button
                type="button"
                onClick={() => setIsConfirmingClose(false)}
                className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon & Title Header */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C] shrink-0">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Close Daily Log</h3>
                  <p className="text-xs text-zinc-400 font-medium">Finalize active operating session</p>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 mb-5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-zinc-200">
                    Are you sure you want to close your daily log <span className="font-bold text-white">&quot;{activeLog.name}&quot;</span>? This finalizes stats for today.
                  </p>
                </div>
              </div>

              {/* Session Performance Breakdown */}
              <div className="rounded-2xl border border-[#252525] bg-[#141414] p-4 space-y-2.5 mb-6">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Today&apos;s Session Summary
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Money In (Sales)</span>
                  <span className="font-mono font-bold text-emerald-400">${activeLog.stats?.moneyIn || '0'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Money Out (Purchases)</span>
                  <span className="font-mono font-bold text-red-400">${activeLog.stats?.moneyOut || '0'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Expenses</span>
                  <span className="font-mono font-bold text-orange-400">${activeLog.stats?.expenses || '0'}</span>
                </div>
                <div className="pt-2 border-t border-[#252525] flex justify-between items-center text-sm font-bold">
                  <span className="text-white">Net Session Profit</span>
                  <span className={clsx(
                    "font-mono",
                    parseFloat(activeLog.stats?.profit || '0') >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    ${activeLog.stats?.profit || '0'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmingClose(false)}
                  className="flex-1 rounded-xl border border-[#252525] bg-[#141414] hover:bg-[#1E1E1E] px-4 py-3 text-xs font-bold text-zinc-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmClose}
                  disabled={closeLog.isPending}
                  className="flex-1 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-4 py-3 text-xs font-bold text-white shadow-lg transition-all border border-[#E8001C]/50 disabled:opacity-50"
                >
                  {closeLog.isPending ? 'Closing Log...' : 'Finalize & Close Log'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
}
