import { type RouteProps, Navigate } from "react-router";
import AppLayout from "../layouts/AppLayout";
import AuthGate from "../layouts/AuthGate";
import CallbackPage from "../pages/CallbackPage";
import DashboardPage from "../pages/DashboardPage";
import ExpensesPage from "../pages/ExpensesPage";
import AddExpensePage from "../pages/AddExpensePage";
import CategoriesPage from "../pages/CategoriesPage";
import AddCategoryPage from "../pages/AddCategoryPage";

export interface AppRoute extends Omit<RouteProps, "children"> {
  children?: AppRoute[];
  label?: string;
}

const appRoutes: AppRoute[] = [
  { path: "/callback", element: <CallbackPage /> },
  {
    element: <AuthGate />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage />, label: "Dashboard" },
          { path: "/expenses", element: <ExpensesPage />, label: "Expenses" },
          { path: "/expenses/new", element: <AddExpensePage />, label: "Add Expense" },
          { path: "/expenses/:expenseId/edit", element: <AddExpensePage />, label: "Edit Expense" },
          { path: "/categories", element: <CategoriesPage />, label: "Categories" },
          { path: "/categories/new", element: <AddCategoryPage />, label: "Add Category" },
          { path: "/categories/:categoryId/edit", element: <AddCategoryPage />, label: "Edit Category" },
        ],
      },
    ],
  },
];

export default appRoutes;
