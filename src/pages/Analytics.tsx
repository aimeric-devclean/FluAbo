import React from 'react';
import { Header } from '../components/Header';
import { useStore } from '../store/useStore';
import {
  getCategoryTotals,
  getUpcomingCharges,
  toMonthlyEquivalent,
  getCurrentPayer,
} from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import dayjs from 'dayjs';
import { getCurrencySymbol } from '../utils/currency';
import { DynamicBackground } from '../components/DynamicBackground';
import { Sparkles, TrendingUp, Calendar } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { subscriptions, members, theme, currency } = useStore();

  const categoryTotals = getCategoryTotals(subscriptions);
  const upcomingCharges = getUpcomingCharges(subscriptions, 30);

  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    montant: parseFloat(amount.toFixed(2)),
  }));

  const COLORS = [
    '#6B9EFF',
    '#2563eb',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#B897FF',
    '#FF99D8',
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
        <div className="px-4 pt-20 pb-28 max-w-2xl mx-auto animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Analysez vos dépenses
              </p>
            </div>
          </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-5 shadow-sm [&_*]:outline-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-500/25 dark:to-purple-500/25 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Par catégorie
              </h2>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                  <XAxis
                    dataKey="category"
                    stroke="currentColor"
                    className="text-gray-600 dark:text-slate-400"
                    style={{ fontSize: '10px', fontWeight: 600 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-gray-600 dark:text-slate-400"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      color: '#1e293b',
                      backdropFilter: 'blur(20px)',
                      padding: '8px 12px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} ${getCurrencySymbol(currency)}`, 'Montant']}
                  />
                  <Bar dataKey="montant" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6B9EFF" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600 dark:text-slate-400 py-12 font-medium text-sm">
                Aucune donnée
              </p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-5 shadow-sm [&_*]:outline-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/15 dark:from-blue-500/25 dark:to-blue-500/25 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Répartition
              </h2>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="montant"
                    nameKey="category"
                    label={(entry) => `${entry.montant.toFixed(0)} ${getCurrencySymbol(currency)}`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      color: '#1e293b',
                      backdropFilter: 'blur(20px)',
                      padding: '8px 12px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [`${value.toFixed(2)} ${getCurrencySymbol(currency)}`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600 dark:text-slate-400 py-12 font-medium text-sm">
                Aucune donnée
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            À venir (30 jours)
          </h2>
        </div>
        {upcomingCharges.length === 0 ? (
          <div className="relative overflow-hidden rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 text-center border border-gray-200/30 dark:border-slate-700/30 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-pink-500/5" />
            <div className="relative z-10">
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Aucune échéance dans les 30 prochains jours
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingCharges.map((sub) => {
              const currentPayer = getCurrentPayer(sub);
              const currentPayerMember = currentPayer
                ? members.find((m) => m.id === currentPayer)
                : null;
              const monthlyPrice = toMonthlyEquivalent(sub.price, sub.billing);
              const daysUntil = dayjs(sub.nextCharge).diff(dayjs(), 'day');

              return (
                <div key={sub.id} className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-3 shadow-sm active:scale-[0.98] transition-all duration-200">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {sub.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600 dark:text-slate-400">
                          {dayjs(sub.nextCharge).format('DD MMM')}
                        </p>
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold border border-orange-500/30">
                          J-{daysUntil}
                        </span>
                      </div>
                      {sub.familial && currentPayerMember && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentPayerMember.color }} />
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${currentPayerMember.color}20`,
                              color: currentPayerMember.color
                            }}
                          >
                            {currentPayerMember.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400 bg-clip-text text-transparent">
                        {sub.price.toFixed(0)} {getCurrencySymbol(currency)}
                      </p>
                      {sub.billing !== 'monthly' && (
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-0.5">
                          {monthlyPrice.toFixed(0)}{getCurrencySymbol(currency)}/mois
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
};
