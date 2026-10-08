import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ExperimentRoot } from './experiments/conversational-search/ExperimentRoot';

// Ruta aislada del experimento: se resuelve por pathname, sin agregar un
// router al proyecto. No afecta el comportamiento de la app real (App).
const isExperiment = window.location.pathname.startsWith('/experimentos/busqueda-conversacional');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isExperiment ? <ExperimentRoot /> : <App />}
  </StrictMode>
);
