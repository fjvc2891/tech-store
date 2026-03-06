import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import ProductPage from './pages/ProductPage';
import './index.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="container">
          <Routes>
            <Route path="/" element={<ProductPage />} />
            {/* Steps 2, 3, 4 will be implemented next */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
