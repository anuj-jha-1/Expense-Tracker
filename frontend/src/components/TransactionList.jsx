import { Button } from "@/components/ui/button";
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getCategoryIcon = (category) => {
  const icons = {
    Food: "🍔",
    Transportation: "🚗",
    Entertainment: "🎬",
    Shopping: "🛍️",
    Bills: "📄",
    Healthcare: "⚕️",
    Education: "📚",
    Salary: "💼",
    Freelance: "💻",
    Business: "📈",
    Investment: "💰",
    Other: "📌",
  };
  return icons[category] || "📌";
};

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-transactions">
        <p className="text-gray-500 text-lg">No transactions yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="transaction-list">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="transaction-item bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4 flex items-center justify-between hover:bg-white/80"
          data-testid={`transaction-item-${transaction.id}`}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-2xl">
              {getCategoryIcon(transaction.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{transaction.description}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {transaction.category}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-lg font-bold ${
                transaction.type === "income" ? "text-green-600" : "text-red-600"
              }`}>
                {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {transaction.type === "income" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {transaction.type}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(transaction)}
                className="rounded-lg hover:bg-indigo-50"
                data-testid={`edit-transaction-${transaction.id}`}
              >
                <Edit className="w-4 h-4 text-indigo-600" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg hover:bg-red-50"
                    data-testid={`delete-transaction-${transaction.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this transaction? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(transaction.id)}
                      className="bg-red-600 hover:bg-red-700 rounded-xl"
                      data-testid={`confirm-delete-${transaction.id}`}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}