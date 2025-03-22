import { useState } from 'react';
import JsonEditor from './components/JsonEditor';
import DiagramView from './components/DiagramView/index';
import StatsBar from './components/StatsBar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import './App.css';

function App() {
  const [jsonData, setJsonData] = useState(initialJson);
  
  const handleJsonChange = (newJsonData) => {
    try {
      setJsonData(newJsonData);
    } catch (error) {
      console.error("Error al actualizar JSON:", error);
    }
  };

  // Función para cargar JSON desde archivo
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          setJsonData(content);
        } catch (error) {
          console.error("Error al parsear el archivo JSON:", error);
          alert("El archivo no contiene un JSON válido");
        }
      };
      reader.readAsText(file);
    }
  };

  // Función para exportar JSON a archivo
  const handleExport = () => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <header className="bg-gray-900 p-4 flex items-center justify-between border-b border-blue-900/40 shadow-md">
        <div className="flex items-center gap-3">
          <svg 
            className="w-7 h-7 text-blue-500" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 5H3"></path>
            <path d="M9 9h1"></path>
            <path d="M14 9h1"></path>
            <path d="M9 13h1"></path>
            <path d="M14 13h1"></path>
            <path d="M9 17h1"></path>
            <path d="M14 17h1"></path>
            <rect x="3" y="5" width="18" height="16" rx="2"></rect>
          </svg>
          <h1 className="!text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Visualizador de JSON
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="file-upload"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-900/20"
            tabIndex="0"
            aria-label="Importar archivo JSON"
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-upload').click()}
          >
            <svg 
              className="w-4 h-4" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Importar JSON
          </label>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-gray-900/30"
            aria-label="Exportar JSON"
            tabIndex="0"
          >
            <svg 
              className="w-4 h-4" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar
          </button>
        </div>
      </header>
      
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={40} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="p-2 bg-gray-800 text-sm">Editor JSON</div>
            <div className="flex-grow">
              <JsonEditor jsonData={jsonData} onChange={handleJsonChange} />
            </div>
            <StatsBar jsonData={jsonData} />
          </div>
        </Panel>
        
        <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-blue-600 cursor-col-resize" />
        
        <Panel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="p-2 bg-gray-800 text-sm">Visualización</div>
            <div className="flex-grow">
              <DiagramView jsonData={jsonData} />
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

// JSON inicial basado en la imagen proporcionada
const initialJson = {
  "fruits": [
    {
      "name": "Apple",
      "color": "Red",
      "nutrients": {
        "calories": 52,
        "fiber": "2.4g",
        "vitaminC": "4.6mg"
      }
    },
    {
      "name": "Banana",
      "color": "Yellow",
      "nutrients": {
        "calories": 89,
        "fiber": "2.6g",
        "potassium": "358mg"
      }
    },
    {
      "name": "Orange",
      "color": "Orange",
      "nutrients": {
        "calories": 47,
        "fiber": "2.4g",
        "vitaminC": "53.2mg"
      }
    }
  ]
};

export default App;
