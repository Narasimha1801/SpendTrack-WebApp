export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  accountType: string;
};

export type SpendingCategory = {
  name: string;
  amount: number;
  color: string;
};

export type RecentTransaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  icon: "coffee" | "shopping" | "salary" | "transport";
};

export const mockUserProfile: UserProfile = {
  firstName: "Narasimha",
  lastName: "Lakshmi",
  email: "narasimha@example.com",
  mobileNumber: "+91 98765 43210",
  accountType: "Personal Account",
};

export const mockFinanceOverview = {
  totalBalance: 48250,
  monthlyIncome: 65000,
  monthlyExpenses: 16750,
  incomeChange: "+12.5%",
};

export const mockSpendingCategories: SpendingCategory[] = [
  { name: "Food & Drinks", amount: 5900, color: "#7C8D78" },
  { name: "Shopping", amount: 4700, color: "#B18B69" },
  { name: "Transport", amount: 2650, color: "#71879A" },
  { name: "Bills", amount: 3500, color: "#9B83A5" },
];

export const mockRecentTransactions: RecentTransaction[] = [
  {
    id: "starbucks",
    merchant: "Starbucks",
    category: "Food & Drinks",
    amount: 450,
    type: "expense",
    icon: "coffee",
  },
  {
    id: "amazon",
    merchant: "Amazon",
    category: "Shopping",
    amount: 2499,
    type: "expense",
    icon: "shopping",
  },
  {
    id: "salary",
    merchant: "Monthly Salary",
    category: "Salary",
    amount: 65000,
    type: "income",
    icon: "salary",
  },
  {
    id: "uber",
    merchant: "Uber",
    category: "Transport",
    amount: 320,
    type: "expense",
    icon: "transport",
  },
];

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const preciseInrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number, precise = false) {
  return (precise ? preciseInrFormatter : inrFormatter).format(amount);
}
