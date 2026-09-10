import { useRoutes } from "react-router-dom";
import { Fragment } from "react";
import { tokenIdentity } from "./lib/authClient";
import { appRoutes } from "./routes/routes";
import { useAutoLogin } from "./hooks/useAutoLogin";
import { useAuth } from "./store/auth";
import { authClient } from "./lib/http";
import "./lib/sessionEffects";


function App() {
  useAutoLogin();

  const session = useAuth();
  const element = useRoutes(appRoutes);
  if (session.status === "checking") return <div role="status" className="p-6 text-text">Восстанавливаем сессию…</div>;
  if (session.status === "error") return <div role="alert" className="p-6 space-y-4 text-text">
    <p>{session.error}</p>
    <button className="underline mr-4" onClick={() => void authClient.bootstrap()}>Повторить</button>
    <button className="underline" onClick={authClient.dismissSession}>Войти заново</button>
  </div>;
  return <Fragment key={`${session.boundary}:${tokenIdentity(session.token)?.userId ?? ""}`}>{element}</Fragment>;
}

export default App;
