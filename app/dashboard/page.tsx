'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { ChartBarDefault } from '@/components/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Key, Zap, TrendingUp, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Suspense } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

function DashboardContent() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/user/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        return json;
      }
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Detect ?payment=processing in URL and start polling for plan upgrade
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'processing') {
      setPaymentStatus('processing');
    }
  }, [searchParams]);

  // Poll every 3s up to 10 times when payment is processing
  useEffect(() => {
    if (paymentStatus !== 'processing') return;
    if (pollCount >= 10) return; // give up after 30s

    const timer = setTimeout(async () => {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const user = await res.json();
        if (user.plan === 'supporter') {
          setPaymentStatus('success');
          await fetchAnalytics(); // refresh dashboard stats
          // Clean URL params
          router.replace('/dashboard', { scroll: false });
          return;
        }
      }
      setPollCount(c => c + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [paymentStatus, pollCount, fetchAnalytics, router]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="flex h-64 items-center justify-center">
           <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Formatting stats from returned API data
  const stats = [
    {
      title: t.dashboard.apiCallsToday,
      value: data?.calls_today?.toLocaleString() || '0',
      change: t.dashboard.resetAtMidnight,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: t.dashboard.apiCallsThisMonth,
      value: data?.calls_this_month?.toLocaleString() || '0',
      change: t.dashboard.currentBillingPeriod,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: t.dashboard.lastUsed,
      value: data?.last_used ? formatDistanceToNow(new Date(data.last_used), { addSuffix: true }) : t.dashboard.never,
      change: t.dashboard.mostRecentRequest,
      icon: Key,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: t.dashboard.rateLimit,
      value: `${data?.rate_limit || 30} ${t.dashboard.perMin}`,
      change: data?.rate_limit === 120 ? t.dashboard.supporterPlan : t.dashboard.freePlan,
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
  ];

  // Map the chart data directly for the ChartBarDefault component
  let chartData: { month: string; calls: number }[] = [];
  let trendPercent = '0';
  let isTrendUp = true;

  if (data?.chart && data.chart.length > 0) {
    // API returns format: { month: '2025-11', total: 821 }
    // Sort array temporally
    const sortedChart = [...data.chart].sort((a, b) => a.month.localeCompare(b.month));
    
    chartData = sortedChart.map((row: any) => {
      // row.month is "YYYY-MM"
      const [year, monthNum] = row.month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      return {
        month: date.toLocaleString('en', { month: 'short' }), // "Nov", "Dec", etc
        calls: row.total
      };
    });

    // Calculate trend lines if we have at least 2 months
    if (sortedChart.length >= 2) {
      const thisMonth = sortedChart[sortedChart.length - 1].total;
      const lastMonth = sortedChart[sortedChart.length - 2].total;
      
      if (lastMonth === 0) {
        trendPercent = thisMonth > 0 ? '100+' : '0';
        isTrendUp = thisMonth >= lastMonth;
      } else {
        const trend = ((thisMonth - lastMonth) / lastMonth) * 100;
        trendPercent = Math.abs(trend).toFixed(1);
        isTrendUp = trend >= 0;
      }
    }
  }

  const isSupporter = data?.rate_limit === 120;

  return (
    <div className="flex flex-col h-full w-full">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-4 md:p-8 space-y-6 w-full max-w-7xl mx-auto">

        {/* Payment status banner */}
        <AnimatePresence>
          {paymentStatus === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4"
            >
              <Clock className="h-5 w-5 shrink-0 animate-pulse text-yellow-500" />
              <div>
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {t.dashboard.paymentProcessing}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.dashboard.paymentConfirming}
                </p>
              </div>
            </motion.div>
          )}
          {paymentStatus === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {t.dashboard.nowSupporter}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.dashboard.planUpgraded}
                </p>
              </div>
              <button
                onClick={() => setPaymentStatus(null)}
                className="ms-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.dashboard.dismiss}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page heading */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.dashboardTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {t.dashboard.dashboardDesc}
          </p>
        </div>

        {/* Plan banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-xl border px-5 py-3 ${
            isSupporter 
              ? 'border-purple-500/30 bg-purple-500/10' 
              : 'border-yellow-500/30 bg-yellow-500/10'
          }`}
        >
          <Zap className={`h-5 w-5 shrink-0 ${isSupporter ? 'text-purple-500' : 'text-yellow-500'}`} />
          <div>
            <p className={`text-sm font-semibold ${isSupporter ? 'text-purple-600 dark:text-purple-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {isSupporter ? t.dashboard.supporterPlan : t.dashboard.freePlan}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSupporter 
                ? t.dashboard.supporterDesc 
                : t.dashboard.freeDesc}
            </p>
          </div>
          {!isSupporter && (
            <a
              href="/#pricing"
              className="ms-auto shrink-0 rounded-lg bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600 transition-colors"
            >
              {t.dashboard.upgrade}
            </a>
          )}
        </motion.div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bg} rounded-lg p-2`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <ChartBarDefault 
            data={chartData} 
            isUp={isTrendUp} 
            trendText={isTrendUp ? t.dashboard.trendingUp.replace('{percent}', trendPercent) : t.dashboard.trendingDown.replace('{percent}', trendPercent)} 
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-full w-full">
        <div className="flex h-full items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
