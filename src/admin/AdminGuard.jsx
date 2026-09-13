import { Navigate } from 'react-router-dom';

/**
 * AdminGuard — Protege todas as rotas do painel admin.
 * Se não houver sessão admin, redireciona para /admin/login.
 * Quando o Firebase estiver integrado, substituir a verificação
 * do sessionStorage pela verificação do onAuthStateChanged.
 */
export default function AdminGuard({ children }) {
  const session = sessionStorage.getItem('myro_admin');

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    JSON.parse(session); // valida que é JSON válido
  } catch {
    sessionStorage.removeItem('myro_admin');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
