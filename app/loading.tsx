import { LoadingLogo } from "./loading-logo";

// Cobre a primeira carga de qualquer rota fora de /app (login, onboarding,
// site). A árvore de dentro de /app tem o seu próprio loading.tsx — sem
// ele, trocar de tela lá dentro (ex: ir pra Mais) não reaproveita esse
// aqui, porque o layout de /app já está montado e só a página muda.
export default function Loading() {
  return <LoadingLogo />;
}
