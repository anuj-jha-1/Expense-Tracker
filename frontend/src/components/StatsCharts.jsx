import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#4facfe",
  "#43e97b",
  "#fa709a",
  "#feca57",
  "#48dbfb",
];

export default function StatsCharts({ stats }) {
  const hasExpenseData = stats.expense_by_category && stats.expense_by_category.length > 0;
  const hasIncomeData = stats.income_by_category && stats.income_by_category.length > 0;

  if (!hasExpenseData && !hasIncomeData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expense Distribution Pie Chart */}
      {hasExpenseData && (
        <div className="glass-effect rounded-3xl p-6 shadow-xl" data-testid="expense-chart">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Spectral, serif' }}>
            Expense Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.expense_by_category}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
              >
                {stats.expense_by_category.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income vs Expense Bar Chart */}
      {hasIncomeData && (
        <div className="glass-effect rounded-3xl p-6 shadow-xl" data-testid="income-chart">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Spectral, serif' }}>
            Income by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.income_by_category}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="category" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="total" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}