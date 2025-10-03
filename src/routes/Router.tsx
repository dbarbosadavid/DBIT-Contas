import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import About from "../pages/About";
import Balanco from "../pages/Balanco";
import Lancamentos from "../pages/Lancamentos";
import LivroRazao from "../pages/LivroRazao";
import NovoLancamento from "../pages/NovoLancamento";
import Contas from "../pages/CadastroConta";
import ListaContas from "../pages/ListaContas";

const AppRoutes: React.FC = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Balanco />} />
      <Route path="/lancamentos" element={<Lancamentos />} />
      <Route path="/livro-razao" element={<LivroRazao />} />
      <Route path="/contas" element={<ListaContas />} />
      <Route path="/cadastro-conta" element={<Contas key="new" />} />
      <Route path="/cadastro-conta/:id" element={<Contas key="edit" />} />
      <Route path="/about" element={<About />} />
      <Route path="/novo-lancamento" element={<NovoLancamento key="new" />} />
      <Route path="/novo-lancamento/:id" element={<NovoLancamento key="edit" />} />

    </RouterRoutes>
  );
};

export default AppRoutes;