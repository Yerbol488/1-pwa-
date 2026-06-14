import { AppDataProvider } from "../context/AppDataContext";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <AppDataProvider>
      <AppRoutes />
    </AppDataProvider>
  );
}
