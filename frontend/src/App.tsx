import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Jobs from "./pages/Jobs";
import Projects from "./pages/Projects";
import Requests from "./pages/Requests";
import Roadmap from "./pages/Roadmap";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
