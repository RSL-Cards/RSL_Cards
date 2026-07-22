'use client';


import { useActiveDailyLog, useCreateDailyLog, useCloseDailyLog, useAddExpense, useDailyLogTransactions } from '@/hooks/dashboard/useDailyLog';
import { Plus, X, DollarSign, Activity, Settings2, Trash2, List } from 'lucide-react';
import clsx from 'clsx';
import React, { useState, Fragment } from 'react';

export default function DailyLogPanel() {
  const { data: activeLog, isLoading } = useActiveDailyLog();
  const createLog = useCreateDailyLog();
  const closeLog = useCloseDailyLog();
  const addExpense = useAddExpense();

  const [isOpening, setIsOpening] = useState(false);
  const [newLogName, setNewLogName] = useState('');

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');

  const [isViewingTransactions, setIsViewingTransactions] = useState(false);
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
      { name: newLogName },
      {
        onSuccess: () => {
          setIsOpening(false);
          setNewLogName('');
        }
      }
    );
  };

  const handleCloseLog = () => {
    if (!activeLog) return;
    if (window.confirm(`Are you sure you want to close your daily log "${activeLog.name}"? This finalizes stats for today.`)) {
      closeLog.mutate(activeLog.id);
    }
  };

  const handleAddExpense = () => {
    if (!expenseCategory || !expenseAmount) return;
    addExpense.mutate(
      {
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        description: expenseNote,
        dailyLogId: activeLog?.id,
      },
      {
        onSuccess: () => {
          setIsAddingExpense(false);
          setExpenseCategory('');
          setExpenseAmount('');
          setExpenseNote('');
        }
      }
    );
  };

  if (!activeLog && !isOpening) {
    return (
      <div className="bg-[#0D0D0D] rounded-2xl border border-[#252525] p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
          <span className="text-sm font-medium">No Active Log</span>
        </div>
        <button
          onClick={() => setIsOpening(true)}
          className="text-sm font-semibold text-[#E8001C] hover:text-red-400"
        >
          Open Log
        </button>
      </div>
    );
  }

  if (!activeLog && isOpening) {
    return (
      <div className="bg-[#0D0D0D] rounded-2xl border border-[#252525] p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Activity className="w-5 h-5 text-[#E8001C]" />
          <h3 className="text-sm font-semibold text-white">Open Daily Log</h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Log Name (e.g., Dallas Card Show Day 1)"
            value={newLogName}
            onChange={(e) => setNewLogName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-[#141414] border border-[#252525] rounded-lg focus:outline-none focus:border-[#E8001C] text-white placeholder:text-zinc-500"
            autoFocus
          />
          <button
            onClick={() => setIsOpening(false)}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-[#141414] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateLog}
            disabled={createLog.isPending || !newLogName}
            className="px-4 py-2 text-sm font-medium text-white bg-[#E8001C] hover:bg-[#CC0018] disabled:opacity-50 rounded-lg"
          >
            {createLog.isPending ? 'Opening...' : 'Start'}
          </button>
        </div>
      </div>
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

        {/* Add Expense Modal Inline */}
        {isAddingExpense && (
          <div className="mt-4 pt-4 border-t border-[#252525]">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-white">Record Expense</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Category (e.g. Travel, Supplies)"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="px-3 py-2 text-sm bg-[#141414] border border-[#252525] text-white placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-[#E8001C]"
              />
              <input
                type="number"
                placeholder="Amount (e.g. 150)"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="px-3 py-2 text-sm bg-[#141414] border border-[#252525] text-white placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-[#E8001C]"
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                className="px-3 py-2 text-sm bg-[#141414] border border-[#252525] text-white placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-[#E8001C]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingExpense(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-[#141414] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={addExpense.isPending || !expenseCategory || !expenseAmount}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#E8001C] hover:bg-[#CC0018] disabled:opacity-50 rounded-lg"
              >
                {addExpense.isPending ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
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
                          <div key={tx.id} className="flex items-center justify-between p-2 bg-[#0D0D0D] border border-[#252525] rounded shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">
                                {tx.description || 'Unknown'}
                              </span>
                              <span className="text-xs text-zinc-400">
                                {new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
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
      </div>
    );
  }

  return null;
}
