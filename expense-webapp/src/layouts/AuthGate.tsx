import { useEffect, useState, type JSX } from "react";
import { Outlet } from "react-router";
import { Box, CircularProgress } from "@wso2/oxygen-ui";
import { currentUser, signIn } from "../auth";

/**
 * Gates every signed-in screen behind Thunder SSO. No household data renders
 * until a session is confirmed: a signed-in user proceeds to the routed
 * screen; anyone else is sent straight to sign-in, never shown a login form
 * of this app's own.
 */
export default function AuthGate(): JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void currentUser().then((user) => {
      if (cancelled) return;
      if (user) {
        setReady(true);
      } else {
        void signIn();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
}
