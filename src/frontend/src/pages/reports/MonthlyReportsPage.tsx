import { useState } from 'react';
import { useGetMonthlyReport } from '../../hooks/useQueries';
import { UserRole, Currency } from '../../backend';
import RequireRole from '../../components/auth/RequireRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mic, Camera, Radio, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CURRENCIES, DEFAULT_CURRENCY, getCurrencyTotal, formatCurrency, getCurrencyChartLabel } from '../../utils/currency';

function MonthlyReportsContent() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(DEFAULT_CURRENCY);

  const { data: report, isLoading } = useGetMonthlyReport(
    BigInt(selectedYear),
    BigInt(selectedMonth)
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const totalIncome = report ? getCurrencyTotal(report.totalMonthIncome, selectedCurrency) : BigInt(0);
  const recordingIncome = report ? getCurrencyTotal(report.totalMonthIncomeRecording, selectedCurrency) : BigInt(0);
  const podcastIncome = report ? getCurrencyTotal(report.totalMonthIncomePodcast, selectedCurrency) : BigInt(0);
  const photoVideoIncome = report ? getCurrencyTotal(report.totalMonthIncomePhotoVideo, selectedCurrency) : BigInt(0);

  const chartData = report ? [
    {
      name: 'Recording',
      visits: Number(report.totalVisitsCountRecording),
      income: Number(recordingIncome) / 100,
    },
    {
      name: 'Podcast',
      visits: Number(report.totalVisitsCountPodcast),
      income: Number(podcastIncome) / 100,
    },
    {
      name: 'Photo/Video',
      visits: Number(report.totalVisitsCountPhotoVideo),
      income: Number(photoVideoIncome) / 100,
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Monthly Reports</h1>
        <p className="text-muted-foreground">
          Studio usage and income analytics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as Currency)}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.label} ({currency.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalIncome, selectedCurrency)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {months[Number(selectedMonth) - 1]} {selectedYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(report.totalVisitedCount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All studios combined
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recording Studio</CardTitle>
                <Mic className="h-4 w-4 text-[oklch(0.646_0.222_41.116)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(report.totalVisitsCountRecording)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(recordingIncome, selectedCurrency)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Podcast Studio</CardTitle>
                <Radio className="h-4 w-4 text-[oklch(0.6_0.118_184.704)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(report.totalVisitsCountPodcast)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(podcastIncome, selectedCurrency)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Studio Performance</CardTitle>
              <CardDescription>
                Visits and income by studio type ({CURRENCIES.find(c => c.code === selectedCurrency)?.label})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="oklch(0.646 0.222 41.116)" />
                  <YAxis yAxisId="right" orientation="right" stroke="oklch(0.6 0.118 184.704)" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="visits" fill="oklch(0.646 0.222 41.116)" name="Visits" />
                  <Bar yAxisId="right" dataKey="income" fill="oklch(0.6 0.118 184.704)" name={getCurrencyChartLabel(selectedCurrency)} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-[oklch(0.646_0.222_41.116)]" />
                  Recording Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Visits</span>
                  <span className="font-medium">{Number(report.totalVisitsCountRecording)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Income</span>
                  <span className="font-medium">{formatCurrency(recordingIncome, selectedCurrency)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-[oklch(0.6_0.118_184.704)]" />
                  Podcast Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Visits</span>
                  <span className="font-medium">{Number(report.totalVisitsCountPodcast)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Income</span>
                  <span className="font-medium">{formatCurrency(podcastIncome, selectedCurrency)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[oklch(0.769_0.188_70.08)]" />
                  Photo/Video Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Visits</span>
                  <span className="font-medium">{Number(report.totalVisitsCountPhotoVideo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Income</span>
                  <span className="font-medium">{formatCurrency(photoVideoIncome, selectedCurrency)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonthlyReportsPage() {
  return (
    <RequireRole allowedRoles={[UserRole.admin, UserRole.user]}>
      <MonthlyReportsContent />
    </RequireRole>
  );
}
