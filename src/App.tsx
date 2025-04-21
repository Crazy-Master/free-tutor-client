import { useRoutes } from "react-router-dom";
import { appRoutes } from "./routes/routes";
import { useAutoLogin } from "./hooks/useAutoLogin";


function App() {
  useAutoLogin();

  const element = useRoutes(appRoutes);
  return element;
}

export default App;