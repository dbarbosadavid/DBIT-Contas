import React, { useState } from "react";
import googleLogo from "../assets/google-logo.png"
import dbitLogo from "../assets/dbit-logo.png"
import { handleLogin, handleSignup, signInWithGoogle } from "../firebase/useAuth";


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setSenha] = useState("");
  
  function login(e: React.FormEvent) {
    handleLogin(e, email, password);
  }

  function signup(e: React.FormEvent) {
    handleSignup(e, email, password);
  }

  return (
    <>
      <img src={dbitLogo} alt="" id="dbit-logo"/>      
      <h1>Bem vindo ao DBIT!!!</h1>
      <div id="form">

        <form>
          <h1>Login</h1>
            <input
                id="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br/>
            <input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setSenha(e.target.value)}
            />
            <br/>
            <button className="formButton" onClick={login}>Entrar</button>
            <br/>
            <p>Não tem conta? Cadastre-se!</p>
            <button className="formButton" onClick={signup}>Cadastrar-se</button>
        </form>
        <button onClick={signInWithGoogle}>
          <img src={googleLogo} width="30"/>
          <br/>
          Logar com Google
        </button>
      </div>

    </>
  );
};

export default Login;
