import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import RegisterPage from './pages/RegisterPage';
import ListBookPage from './pages/ListBookPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/list" element={<ListBookPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </Layout>
  );
}
