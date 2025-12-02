
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ContributePage from './pages/ContributePage';
import DataViewPage from './pages/DataViewPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/data" element={<DataViewPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;