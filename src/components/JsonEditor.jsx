import { useEffect, useRef, useState } from 'react';
import monaco from '../monaco-setup';

// Estilos para errores de JSON
const errorStyles = `
  .json-error-line {
    text-decoration: wavy underline red;
    font-weight: bold;
    color: #ff6b6b !important;
  }
  .json-error-line-background {
    background-color: rgba(255, 0, 0, 0.2);
  }
`;

// Añadir estilos al head una sola vez
if (typeof document !== 'undefined') {
  const styleId = 'json-editor-error-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = errorStyles;
    document.head.appendChild(styleEl);
  }
}

const JsonEditor = ({ jsonData, onChange }) => {
  const editorRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const [isValidJson, setIsValidJson] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const decorationsRef = useRef([]);
  const previousJsonRef = useRef(null);

  // Función para validar JSON y detectar propiedades duplicadas
  const validateJson = (jsonString) => {
    try {
      // Primero validar con JSON.parse estándar
      JSON.parse(jsonString);
      
      // Luego verificar duplicados
      const lines = jsonString.split('\n');
      const keys = {};
      let duplicateFound = false;
      let duplicateKey = '';
      let duplicateLine = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineRegex = /"([^"]+)"\s*:|'([^']+)'\s*:/g;
        
        let match;
        while ((match = lineRegex.exec(line)) !== null) {
          const key = match[1] || match[2];
          if (keys[key]) {
            // Si ya hemos visto esta clave, es un duplicado
            if (keys[key].parentObject === getCurrentObjectContext(lines, i)) {
              duplicateFound = true;
              duplicateKey = key;
              duplicateLine = i + 1; // Las líneas empiezan en 1 en el editor
              break;
            }
          } else {
            // Registrar la clave y su contexto
            keys[key] = {
              line: i + 1,
              parentObject: getCurrentObjectContext(lines, i)
            };
          }
        }
        
        if (duplicateFound) break;
      }
      
      if (duplicateFound) {
        throw new Error(`Propiedad duplicada "${duplicateKey}" en la línea ${duplicateLine}`);
      }
      
      return { valid: true, error: null };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  };
  
  // Función para determinar el contexto del objeto actual
  const getCurrentObjectContext = (lines, lineIndex) => {
    let bracketCount = 0;
    let currentContext = '';
    
    for (let i = 0; i <= lineIndex; i++) {
      const line = lines[i];
      
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') {
          bracketCount++;
          currentContext += '{';
        } else if (line[j] === '}') {
          bracketCount--;
          currentContext += '}';
        }
      }
    }
    
    return currentContext + bracketCount;
  };

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      try {
        const initialContent = JSON.stringify(jsonData, null, 2);
        
        const editor = monaco.editor.create(editorRef.current, {
          value: initialContent,
          language: 'json',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: {
            enabled: false
          },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
        });

        monacoEditorRef.current = editor;
        setCurrentContent(initialContent);
        previousJsonRef.current = jsonData;

        let timeout;
        editor.onDidChangeModelContent(() => {
          clearTimeout(timeout);
          
          const editorContent = editor.getValue();
          setCurrentContent(editorContent);
          
          timeout = setTimeout(() => {
            // Guardar referencia global del timeout
            window._editorTimeoutId = timeout;
            
            const validation = validateJson(editorContent);
            
            if (validation.valid) {
              setIsValidJson(true);
              setErrorMessage('');
              
              // Limpiar decoraciones de error
              if (decorationsRef.current && decorationsRef.current.length > 0) {
                decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
              }
              
              // Actualizar el diagrama
              const parsedJson = JSON.parse(editorContent);
              onChange(parsedJson);
              previousJsonRef.current = parsedJson;
            } else {
              console.error('JSON inválido:', validation.error);
              setIsValidJson(false);
              setErrorMessage(validation.error);
              
              // Resaltar el error
              const model = editor.getModel();
              if (model) {
                let lineNumber = 1;
                const lineMatch = validation.error.match(/línea (\d+)/);
                if (lineMatch && lineMatch[1]) {
                  lineNumber = parseInt(lineMatch[1], 10);
                }
                
                const decorations = [{
                  range: {
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: model.getLineMaxColumn(lineNumber)
                  },
                  options: {
                    inlineClassName: 'json-error-line',
                    className: 'json-error-line-background',
                    hoverMessage: {
                      value: `Error: ${validation.error}`
                    }
                  }
                }];
                
                decorationsRef.current = editor.deltaDecorations(
                  decorationsRef.current || [],
                  decorations
                );
                
                // Mostrar la línea con error
                editor.revealLineInCenter(lineNumber);
              }
            }
          }, 300);
        });
      } catch (error) {
        console.error("Error al inicializar Monaco Editor:", error);
      }
    }
    
    return () => {
      // Limpieza del editor con manejo de errores
      if (monacoEditorRef.current) {
        try {
          // Asegurarnos de limpiar cualquier timeout pendiente
          if (window._editorTimeoutId) {
            clearTimeout(window._editorTimeoutId);
            window._editorTimeoutId = null;
          }
          
          // Eliminar manejadores de eventos antes de disponer del editor
          monacoEditorRef.current.getModel()?.dispose();
          monacoEditorRef.current.dispose();
          monacoEditorRef.current = null;
        } catch (error) {
          console.warn("Error al limpiar Monaco Editor:", error);
        }
      }
    };
  }, []);

  // Manejar actualizaciones externas de jsonData
  useEffect(() => {
    if (monacoEditorRef.current && 
        JSON.stringify(previousJsonRef.current) !== JSON.stringify(jsonData)) {
      
      const newContent = JSON.stringify(jsonData, null, 2);
      const position = monacoEditorRef.current.getPosition();
      
      monacoEditorRef.current.setValue(newContent);
      setCurrentContent(newContent);
      previousJsonRef.current = jsonData;
      
      if (position) {
        monacoEditorRef.current.setPosition(position);
      }
      
      setIsValidJson(true);
      setErrorMessage('');
    }
  }, [jsonData]);

  return (
    <div className="relative w-full h-full">
      <div ref={editorRef} className="w-full h-full" />
      {!isValidJson && (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium z-10">
          JSON inválido: {errorMessage}
        </div>
      )}
    </div>
  );
};

export default JsonEditor;