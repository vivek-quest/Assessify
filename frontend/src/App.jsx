import { Toaster } from 'react-hot-toast';
import './App.css';
import AllRoutes from './router/Routes';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AllRoutes />
      <Toaster position='top-right' />
    </BrowserRouter>
  );
}

export default App;
