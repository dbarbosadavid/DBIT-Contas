import './App.css'
import { BrowserRouter } from "react-router-dom";
import Body from './components/Body';
import Nav from './components/Nav';
import Login from './pages/Login';
import { useAuth } from './firebase/useAuth';

function App() {
  const { user, loading } = useAuth();

  if(loading){
    return (
      <div className="spinner-container">
        <div className='spinner'></div>
      </div>
    )
  }

  if (user) {
    return (
      <BrowserRouter>
        <Nav />
        <Body /> 
        <footer style={{ left: 0, bottom: 0, width: "100%",marginTop: "2rem", padding: "1rem", textAlign: "center", boxShadow: "0 -2px 8px rgba(0,0,0,0.05)", position: "relative"}}>
          <small>&copy; {new Date().getFullYear()} Sistema Contábil. Todos os direitos reservados.</small>
        </footer>
      </BrowserRouter>
    );
  }
  else {
    return <Login />;
  }
}

export default App
