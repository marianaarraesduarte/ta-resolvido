import { LoadingLogo } from "../loading-logo";

// Cobre toda troca de tela dentro de /app (Meu mês, Quanto gastei, Mais,
// Configurações, Parcelas...) — sem esse arquivo aqui, só a primeira
// entrada em /app ganhava a logo; trocar de página depois, com o layout já
// montado, ficava com tela em branco (ou quase preta no escuro) até os
// dados da próxima tela chegarem.
export default function AppLoading() {
  return <LoadingLogo />;
}
