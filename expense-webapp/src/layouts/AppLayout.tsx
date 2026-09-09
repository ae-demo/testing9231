import { useEffect, useState, type JSX } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { AppShell, Header, Sidebar, Footer, UserMenu } from "@wso2/oxygen-ui";
import { LayoutDashboard, Receipt, Tags, LogOut } from "@wso2/oxygen-ui-icons-react";
import { getDisplayName, signOut } from "../auth";

export default function AppLayout(): JSX.Element {
  const { pathname } = useLocation();
  const [displayName, setDisplayName] = useState("Household Member");

  useEffect(() => {
    void getDisplayName().then(setDisplayName);
  }, []);

  const active = pathname.startsWith("/categories")
    ? "categories"
    : pathname.startsWith("/expenses")
      ? "expenses"
      : "dashboard";

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>Expense Tracker</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <UserMenu>
              <UserMenu.Trigger name={displayName} showName />
              <UserMenu.Header name={displayName} email="" />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar
          activeItem={active}
          onSelect={(id) => {
            if (id === "sign-out") void signOut();
          }}
        >
          <Sidebar.Nav>
            <Sidebar.Category>
              <Sidebar.Item id="dashboard" link={<Link to="/dashboard" />}>
                <Sidebar.ItemIcon>
                  <LayoutDashboard />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Dashboard</Sidebar.ItemLabel>
              </Sidebar.Item>
              <Sidebar.Item id="expenses" link={<Link to="/expenses" />}>
                <Sidebar.ItemIcon>
                  <Receipt />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Expenses</Sidebar.ItemLabel>
              </Sidebar.Item>
              <Sidebar.Item id="categories" link={<Link to="/categories" />}>
                <Sidebar.ItemIcon>
                  <Tags />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Categories</Sidebar.ItemLabel>
              </Sidebar.Item>
              <Sidebar.Item id="sign-out">
                <Sidebar.ItemIcon>
                  <LogOut />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Sign out</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
