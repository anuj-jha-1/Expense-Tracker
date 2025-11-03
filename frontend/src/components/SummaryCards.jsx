import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Income Card */}
      <div className="stat-card glass-effect rounded-3xl p-6 shadow-xl card-3d" data-testid="income-card">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs text-gray-500 bg-green-50 px-3 py-1 rounded-full">Income</div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Income</h3>
        <p className="text-3xl font-bold text-green-600" data-testid="total-income">
          ${summary.total_income.toFixed(2)}
        </p>
      </div>

      {/* Total Expenses Card */}
      <div className="stat-card glass-effect rounded-3xl p-6 shadow-xl card-3d" data-testid="expense-card">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl shadow-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs text-gray-500 bg-red-50 px-3 py-1 rounded-full">Expense</div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Expenses</h3>
        <p className="text-3xl font-bold text-red-600" data-testid="total-expenses">
          ${summary.total_expenses.toFixed(2)}
        </p>
      </div>

      {/* Net Income Card */}
      <div className="stat-card glass-effect rounded-3xl p-6 shadow-xl card-3d" data-testid="net-income-card">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs text-gray-500 bg-indigo-50 px-3 py-1 rounded-full">Net</div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-2">Net Income</h3>
        <p
          className={`text-3xl font-bold ${
            summary.net_income >= 0 ? "text-indigo-600" : "text-red-600"
          }`}
          data-testid="net-income"
        >
          ${summary.net_income.toFixed(2)}
        </p>
      </div>
    </div>
  );
}