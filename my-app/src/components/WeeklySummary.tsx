import { ArrowLeft, Download, Mail, Home, Calendar, BookOpen, User, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import dayjs from "dayjs";

interface WeeklySummaryProps {
  onNavigate: (screen: any) => void;
}

export function WeeklySummary({ onNavigate }: WeeklySummaryProps) {
  const { dailyMealLogs } = useApp();

  // Auto-generate current week (Sunday → Saturday)
  const selectedDate = dayjs();
  const week = Array.from({ length: 7 }).map((_, i) => {
    const date = selectedDate.startOf("week").add(i, "day");  
    return {
      dayName: date.format("ddd"),     // Sun
      dayNum: parseInt(date.format("D")),
      fullDate: date.format("YYYY-MM-DD") // YYYY-MM-DD
    };
  });

  // Get logs only for these 7 days
  const weekLogs = dailyMealLogs.filter(log =>
    week.some(w => w.fullDate === log.date)
  );

  // ---------- STATS ----------
  const totalMealsCount = weekLogs.reduce((sum, log) => {
    return (
      sum +
      log.breakfast.length +
      log.lunch.length +
      log.dinner.length +
      log.snacks.length
    );
  }, 0);

  const totalCalories = weekLogs.reduce((sum, log) => {
    const dayCalories = [
      ...log.breakfast,
      ...log.lunch,
      ...log.dinner,
      ...log.snacks
    ].reduce((s, meal) => s + (meal.calories || 0), 0);
    return sum + dayCalories;
  }, 0);

  const avgCalories = weekLogs.length > 0 ? Math.round(totalCalories / weekLogs.length) : 0;

  // most frequent meal
  const allMeals = weekLogs.flatMap(log => [
    ...log.breakfast,
    ...log.lunch,
    ...log.dinner,
    ...log.snacks
  ]);

  const mealCounts: Record<string, number> = {};
  allMeals.forEach(meal => {
    mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1;
  });

  const mostFrequent =
    Object.entries(mealCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  const topMeals = Object.entries(mealCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const stats = {
    totalMealsCount,
    avgCalories,
    mostFrequent,
    topMeals,
    daysWithMeals: weekLogs.length
  };

  // ---------- EXPORT ----------
  const handleExportPDF = () => {
    const content = `
Plate Planner - Weekly Summary (${week[0].fullDate} to ${week[6].fullDate})

Statistics:
- Total Meals: ${stats.totalMealsCount}
- Avg Calories: ${stats.avgCalories}
- Most Frequent: ${stats.mostFrequent}
- Days Logged: ${stats.daysWithMeals}/7

Top Meals:
${stats.topMeals.map(([meal, count]) => `- ${meal}: ${count} times`).join('\n')}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-summary.txt";
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Summary exported successfully!");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Plate Planner - Weekly Summary");
    const body = encodeURIComponent(`
Weekly Summary (${week[0].fullDate} to ${week[6].fullDate})

Total Meals: ${stats.totalMealsCount}
Average Calories: ${stats.avgCalories}
Most Frequent Meal: ${stats.mostFrequent}
Days with Meals Logged: ${stats.daysWithMeals}/7

Top Meals:
${stats.topMeals.map(([meal, count]) => `${meal}: ${count} times`).join("\n")}
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Opening email client...");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 text-white">
        <button
          onClick={() => onNavigate("track-meals")}
          className="mb-4 flex items-center text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tracking
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white mb-1">Weekly Summary</h2>
            <p className="text-purple-100 text-sm">
              {week[0].fullDate} → {week[6].fullDate}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Calendar */}
        <Card className="p-4 border-2 border-purple-100">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {week.map((d, i) => (
              <div key={i} className="text-center text-xs text-gray-500">
                {d.dayName}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {week.map((d) => {
              const hasLog = dailyMealLogs.some(log => log.date === d.fullDate);
              return (
                <div
                  key={d.fullDate}
                  className={`aspect-square flex items-center justify-center rounded-lg ${
                    hasLog
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {d.dayNum}
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-purple-100 rounded"></div>
              <span className="text-gray-600">Meals logged</span>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <p className="text-gray-700">Week Overview</p>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-2 border-purple-100 bg-purple-50/50">
              <p className="text-xs text-purple-700 mb-1">Total Meals</p>
              <p className="text-purple-900">{stats.totalMealsCount}</p>
            </Card>
            <Card className="p-4 border-2 border-blue-100 bg-blue-50/50">
              <p className="text-xs text-blue-700 mb-1">Avg Calories</p>
              <p className="text-blue-900">{stats.avgCalories}</p>
            </Card>
          </div>

          <Card className="p-4 border-2 border-purple-100">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Most Frequent</span>
                <span className="text-sm text-gray-900">{stats.mostFrequent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Days Logged</span>
                <span className="text-sm text-gray-900">{stats.daysWithMeals}/7</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Meals */}
        <div className="space-y-3">
          <p className="text-gray-700">Top Meals This Week</p>
          {stats.topMeals.length > 0 ? (
            stats.topMeals.map(([meal, count], idx) => (
              <Card key={idx} className="p-4 border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{idx === 0 ? "🥗" : "🍳"}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{meal}</p>
                    <p className="text-xs text-gray-500">Made {count} times</p>
                  </div>
                  <div className="text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-4 border-2 border-gray-200">
              <p className="text-sm text-gray-400 text-center">
                No meals logged this week
              </p>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="h-12 rounded-xl border-2 border-purple-200 hover:border-purple-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handleEmail}
            variant="outline"
            className="h-12 rounded-xl border-2 border-purple-200 hover:border-purple-300 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600" onClick={() => onNavigate("home")}>
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600" onClick={() => onNavigate("track-meals")}>
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Track</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600" onClick={() => onNavigate("recipe")}>
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Recipes</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600" onClick={() => onNavigate("profile")}>
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}