import * as monaco from 'monaco-editor';

// En Vite, importamos los workers de manera especial
// para que se manejen correctamente
const setupMonacoWorkers = () => {
  // URL base para los workers
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Configurar Monaco para el entorno de Vite
  self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      if (label === 'json') {
        // Usar la ruta correcta para el worker de JSON
        return new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url).href;
      }
      // Worker del editor por defecto
      return new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url).href;
    }
  };
};

// Inicializar workers
setupMonacoWorkers();

export default monaco; 