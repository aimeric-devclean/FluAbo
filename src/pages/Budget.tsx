import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle, Calendar, PieChart, Bell, LineChart, BarChart3, Edit2 } from 'lucide-react';
import { Header } from '../components/Header';
import { useStore } from '../store/useStore';
import { getCurrencySymbol } from '../utils/currency';
import { toMonthlyEquivalent } from '../utils/calculations';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

dayjs.extend(relativeTime);
dayjs.locale('fr');

interface BudgetAlert {
  id: string;
  threshold: number;
  type: 'percentage' | 'amount';
  enabled: boolean;
}

interface CategoryBudget {
  category: string;
  limit: number;
}

interface MonthlyHistory {
  month: string;
  total: number;
  subscriptionCount: number;
}

export const Budget: React.FC = () => {
  const { subscriptions, currency, members } = useStore();

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('fluxy_monthly_budget');
    return saved ? parseFloat(saved) : 0;
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('fluxy_category_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState<BudgetAlert[]>(() => {
    const saved = localStorage.getItem('fluxy_budget_alerts');
    return saved ? JSON.parse(saved) : [
      { id: '1', threshold: 80, type: 'percentage', enabled: true },
      { id: '2', threshold: 100, type: 'percentage', enabled: true },
    ];
  });

  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistory[]>(() => {
    const saved = localStorage.getItem('fluxy_monthly_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCategoryBudgets, setShowCategoryBudgets] = useState(false);

  const activeSubscriptions = subscriptions.filter(sub => !sub.isPaused);

  const monthlyTotal = useMemo(() => {
    return activeSubscriptions.reduce((sum, sub) => {
      const monthly = toMonthlyEquivalent(parseFloat(sub.price), sub.billing);
      return sum + monthly;
    }, 0);
  }, [activeSubscriptions]);

  React.useEffect(() => {
    const currentMonth = dayjs().format('YYYY-MM');
    const existingMonth = monthlyHistory.find(h => h.month === currentMonth);

    if (!existingMonth) {
      const newHistory = [
        { month: currentMonth, total: monthlyTotal, subscriptionCount: activeSubscriptions.length },
        ...monthlyHistory
      ].slice(0, 12);
      setMonthlyHistory(newHistory);
      localStorage.setItem('fluxy_monthly_history', JSON.stringify(newHistory));
    } else if (existingMonth.total !== monthlyTotal || existingMonth.subscriptionCount !== activeSubscriptions.length) {
      const newHistory = monthlyHistory.map(h =>
        h.month === currentMonth
          ? { ...h, total: monthlyTotal, subscriptionCount: activeSubscriptions.length }
          : h
      );
      setMonthlyHistory(newHistory);
      localStorage.setItem('fluxy_monthly_history', JSON.stringify(newHistory));
    }
  }, [monthlyTotal, activeSubscriptions.length]);

  const remaining = monthlyBudget - monthlyTotal;
  const percentUsed = monthlyBudget > 0 ? (monthlyTotal / monthlyBudget) * 100 : 0;

  const handleSaveBudget = () => {
    const value = parseFloat(tempBudget) || 0;
    setMonthlyBudget(value);
    localStorage.setItem('fluxy_monthly_budget', value.toString());
    setIsEditing(false);
  };

  const handleSaveCategoryBudget = (category: string, limit: number) => {
    const updated = categoryBudgets.filter(cb => cb.category !== category);
    if (limit > 0) {
      updated.push({ category, limit });
    }
    setCategoryBudgets(updated);
    localStorage.setItem('fluxy_category_budgets', JSON.stringify(updated));
    setEditingCategory(null);
  };

  const handleToggleAlert = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    setAlerts(updated);
    localStorage.setItem('fluxy_budget_alerts', JSON.stringify(updated));
  };

  const upcomingPayments = useMemo(() => {
    const today = dayjs();
    const in7Days = today.add(7, 'days');

    return activeSubscriptions
      .filter(sub => {
        const nextCharge = dayjs(sub.nextCharge);
        return nextCharge.isAfter(today) && nextCharge.isBefore(in7Days);
      })
      .sort((a, b) => dayjs(a.nextCharge).valueOf() - dayjs(b.nextCharge).valueOf())
      .slice(0, 5);
  }, [activeSubscriptions]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    activeSubscriptions.forEach(sub => {
      const monthly = toMonthlyEquivalent(parseFloat(sub.price), sub.billing);
      breakdown[sub.category] = (breakdown[sub.category] || 0) + monthly;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1]);
  }, [activeSubscriptions]);

  const getBudgetStatus = () => {
    if (monthlyBudget === 0) return { color: 'gray', label: 'Budget non défini', icon: AlertCircle };
    if (percentUsed >= 100) return { color: 'red', label: 'Budget dépassé', icon: AlertCircle };
    if (percentUsed >= 80) return { color: 'orange', label: 'Attention budget', icon: AlertCircle };
    return { color: 'green', label: 'Budget respecté', icon: CheckCircle };
  };

  const getActiveAlerts = () => {
    return alerts.filter(alert => {
      if (!alert.enabled) return false;
      if (alert.type === 'percentage') {
        return percentUsed >= alert.threshold;
      }
      return monthlyTotal >= alert.threshold;
    });
  };

  const getPreviousMonth = () => {
    const prevMonth = dayjs().subtract(1, 'month').format('YYYY-MM');
    return monthlyHistory.find(h => h.month === prevMonth);
  };

  const getMonthComparison = () => {
    const prev = getPreviousMonth();
    if (!prev) return null;

    const diff = monthlyTotal - prev.total;
    const percentDiff = prev.total > 0 ? (diff / prev.total) * 100 : 0;

    return { diff, percentDiff, previous: prev };
  };

  const status = getBudgetStatus();
  const StatusIcon = status.icon;
  const activeAlerts = getActiveAlerts();
  const comparison = getMonthComparison();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
        <div className="px-4 pt-20 pb-28 max-w-2xl mx-auto animate-slide-up">
          <div className="mb-6">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Budget Mensuel
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Suivez vos dépenses d'abonnements
            </p>
          </div>

          <div className="space-y-4">
            {activeAlerts.length > 0 && (
              <div className="glass-effect rounded-2xl p-4 shadow-lg bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                      {activeAlerts.length} Alerte{activeAlerts.length > 1 ? 's' : ''} active{activeAlerts.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {activeAlerts[0].type === 'percentage'
                        ? `Vous avez atteint ${percentUsed.toFixed(0)}% de votre budget`
                        : `Vous avez dépassé votre limite de ${getCurrencySymbol(currency)}${activeAlerts[0].threshold}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-effect rounded-2xl p-6 shadow-lg transition-all">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign size={24} className="text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Budget Mensuel</h2>
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                          className="w-full sm:w-32 px-3 py-1.5 rounded-lg border-2 border-violet-500 dark:border-violet-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 text-lg font-bold"
                          placeholder="0.00"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveBudget}
                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold active:scale-95 transition-all"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                          {monthlyBudget > 0 ? `${getCurrencySymbol(currency)}${monthlyBudget.toFixed(2)}` : 'Non défini'}
                        </span>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setTempBudget(monthlyBudget.toString());
                          }}
                          className="p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg active:scale-95 transition-all group"
                          aria-label="Modifier le budget"
                        >
                          <Edit2 size={18} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0 ${
                  status.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  status.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                  status.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <StatusIcon size={14} strokeWidth={2.5} />
                  <span className="text-xs font-bold whitespace-nowrap">{status.label}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dépenses actuelles</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {getCurrencySymbol(currency)}{monthlyTotal.toFixed(2)}
                  </span>
                </div>

                {monthlyBudget > 0 && (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentUsed >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          percentUsed >= 80 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-violet-600 to-blue-600'
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Restant</span>
                      <div className="flex items-center gap-2">
                        {remaining >= 0 ? (
                          <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-lg font-bold ${
                          remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {getCurrencySymbol(currency)}{Math.abs(remaining).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-center pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {percentUsed.toFixed(0)}% du budget utilisé
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {comparison && (
              <div className="glass-effect rounded-2xl p-5 shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={18} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Comparaison mensuelle</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">vs mois dernier</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {dayjs(comparison.previous.month).format('MMMM YYYY')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 justify-end ${
                      comparison.diff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {comparison.diff > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="text-lg font-bold">
                        {comparison.diff > 0 ? '+' : ''}{getCurrencySymbol(currency)}{Math.abs(comparison.diff).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {comparison.percentDiff > 0 ? '+' : ''}{comparison.percentDiff.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full glass-effect rounded-2xl p-4 shadow-lg transition-all active:scale-95 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <LineChart size={18} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Historique ({monthlyHistory.length} mois)</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {showHistory ? 'Masquer' : 'Afficher'}
              </span>
            </button>

            {showHistory && monthlyHistory.length > 0 && (
              <div className="glass-effect rounded-2xl p-5 shadow-lg transition-all">
                <div className="space-y-2">
                  {monthlyHistory.map((history, index) => {
                    const prevHistory = monthlyHistory[index + 1];
                    const diff = prevHistory ? history.total - prevHistory.total : 0;
                    const isCurrentMonth = history.month === dayjs().format('YYYY-MM');

                    return (
                      <div
                        key={history.month}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          isCurrentMonth
                            ? 'bg-violet-100 dark:bg-violet-900/30 ring-1 ring-violet-500/30'
                            : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {dayjs(history.month).format('MMMM YYYY')}
                            {isCurrentMonth && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-violet-600 text-white rounded-full">Actuel</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {history.subscriptionCount} abonnement{history.subscriptionCount > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {getCurrencySymbol(currency)}{history.total.toFixed(2)}
                          </div>
                          {prevHistory && (
                            <div className={`text-xs ${
                              diff > 0 ? 'text-red-600 dark:text-red-400' : diff < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                            }`}>
                              {diff > 0 ? '+' : ''}{getCurrencySymbol(currency)}{diff.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowCategoryBudgets(!showCategoryBudgets)}
              className="w-full glass-effect rounded-2xl p-4 shadow-lg transition-all active:scale-95 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <PieChart size={18} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Budget par catégorie</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {showCategoryBudgets ? 'Masquer' : 'Afficher'}
              </span>
            </button>

            {showCategoryBudgets && categoryBreakdown.length > 0 && (
              <div className="glass-effect rounded-2xl p-5 shadow-lg transition-all">
                <div className="space-y-3">
                  {categoryBreakdown.map(([category, amount]) => {
                    const categoryBudget = categoryBudgets.find(cb => cb.category === category);
                    const percent = monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0;
                    const budgetPercent = categoryBudget ? (amount / categoryBudget.limit) * 100 : 0;
                    const isEditing = editingCategory === category;

                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {getCurrencySymbol(currency)}{amount.toFixed(2)}
                            </span>
                            {categoryBudget && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                / {getCurrencySymbol(currency)}{categoryBudget.limit.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${
                              categoryBudget && budgetPercent >= 100
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : categoryBudget && budgetPercent >= 80
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                : 'bg-gradient-to-r from-violet-500 to-blue-500'
                            }`}
                            style={{ width: `${categoryBudget ? Math.min(budgetPercent, 100) : percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {percent.toFixed(0)}% du total
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                defaultValue={categoryBudget?.limit || ''}
                                placeholder="Limite"
                                className="w-20 px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveCategoryBudget(category, parseFloat((e.target as HTMLInputElement).value) || 0);
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="text-xs text-gray-500 dark:text-gray-400"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="text-xs text-violet-600 dark:text-violet-400 font-semibold"
                            >
                              {categoryBudget ? 'Modifier' : 'Définir limite'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="w-full glass-effect rounded-2xl p-4 shadow-lg transition-all active:scale-95 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Alertes de budget</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {showAlerts ? 'Masquer' : 'Afficher'}
              </span>
            </button>

            {showAlerts && (
              <div className="glass-effect rounded-2xl p-5 shadow-lg transition-all">
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={alert.enabled}
                          onChange={() => handleToggleAlert(alert.id)}
                          className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Alerte à {alert.threshold}{alert.type === 'percentage' ? '%' : getCurrencySymbol(currency)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {alert.type === 'percentage' ? 'du budget utilisé' : 'de dépenses'}
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        alert.enabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {alert.enabled ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingPayments.length > 0 && (
              <div className="glass-effect rounded-2xl p-5 shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Prochains prélèvements (7 jours)</h3>
                </div>
                <div className="space-y-2">
                  {upcomingPayments.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{sub.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(sub.nextCharge).format('DD/MM/YYYY')} ({dayjs(sub.nextCharge).fromNow()})
                        </div>
                      </div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {getCurrencySymbol(currency)}{sub.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-effect rounded-xl p-4 text-center transition-all">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {activeSubscriptions.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Actifs</div>
              </div>
              <div className="glass-effect rounded-xl p-4 text-center transition-all">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {getCurrencySymbol(currency)}{(monthlyTotal * 12).toFixed(0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Par an</div>
              </div>
              <div className="glass-effect rounded-xl p-4 text-center transition-all">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {activeSubscriptions.length > 0 ? getCurrencySymbol(currency) + (monthlyTotal / activeSubscriptions.length).toFixed(0) : '-'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
