import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Jobs from "./pages/Jobs";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
