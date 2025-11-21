import React from "react";
import { Link, useNavigate } from "react-router-dom"
import '../Nav.css';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { SubMenu } from "./SubMenu";

const Nav: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Erro ao deslogar.");
    }
  };

  return (
    <nav id="nav">
      <Link to="/">Balanco</Link>
      <Link to="/lancamentos">
        <SubMenu
          title="Lançamentos"
          items={["Novo Lançamento"]}
          left={"-1.1rem"}
        />
      </Link>
      <Link to="/livro-razao">Livro Razao</Link>
      <Link to="/contas">
        <SubMenu
          title="Contas"
          items={["Cadastro conta"]}
          left={"-2rem"}
        />
      </Link>

      <Link to="/dre">DRE</Link>
      <Link to="/planilha-balanco">Planilha Balanço</Link>
      <Link to="/indices">Índices</Link>

      <Link to="/about">Sobre</Link>
      <a onClick={() => {
        let confirm = window.confirm("Deseja realmente sair? ");
        if (confirm)
          handleLogout()
      }}>Sair</a>
    </nav>
  )
};

export default Nav;
