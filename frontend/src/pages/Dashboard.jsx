import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import AddTransactionModal from "../components/AddTransactionModal";
import TransactionList from "../components/TransactionList";
import StatsCharts from "../components/StatsCharts";
import SummaryCards from "../components/SummaryCards";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, net_income: 0 });
  const [stats, setStats] = useState({ expense_by_category: [], income_by_category: [] });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchData = async () => {
    try {
      const [userRes, transRes, summaryRes, statsRes] = await Promise.all([
        axios.get(`${API}/auth/me`, getAuthHeader()),
        axios.get(`${API}/transactions`, getAuthHeader()),
        axios.get(`${API}/transactions/summary`, getAuthHeader()),
        axios.get(`${API}/transactions/stats`, getAuthHeader()),
      ]);

      setUser(userRes.data);
      setTransactions(transRes.data);
      setSummary(summaryRes.data);
      setStats(statsRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        onLogout();
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (data) => {
    try {
      if (editingTransaction) {
        await axios.put(
          `${API}/transactions/${editingTransaction.id}`,
          data,
          getAuthHeader()
        );
        toast.success("Transaction updated!");
      } else {
        await axios.post(`${API}/transactions`, data, getAuthHeader());
        toast.success("Transaction added!");
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to save transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${API}/transactions/${id}`, getAuthHeader());
      toast.success("Transaction deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType && t.type !== filterType) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    return true;
  });

  const allCategories = [...new Set(transactions.map((t) => t.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="glass-effect border-b border-white/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Spectral, serif' }}>
                    SpendWise
                  </h1>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    setEditingTransaction(null);
                    setIsAddModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
                  data-testid="add-transaction-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="rounded-xl border-gray-300"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Summary Cards */}
          <SummaryCards summary={summary} />

          {/* Charts Section */}
          <StatsCharts stats={stats} />

          {/* Transactions List */}
          <div className="glass-effect rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Spectral, serif' }}>
                Recent Transactions
              </h2>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  data-testid="filter-type-select"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  data-testid="filter-category-select"
                >
                  <option value="">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </main>
      </div>

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleAddTransaction}
        editData={editingTransaction}
      />
    </div>
  );
}