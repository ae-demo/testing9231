import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router";
import { Box, CircularProgress } from "@wso2/oxygen-ui";
import { handleCallback } from "../auth";

export default function CallbackPage(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback()
      .then(() => navigate("/dashboard", { replace: true }))
      .catch(() => navigate("/dashboard", { replace: true }));
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
