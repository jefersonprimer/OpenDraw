import { WhiteboardElement } from './db';

export interface WhiteboardFile {
  version: string;
  elements: WhiteboardElement[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Gera um nome de arquivo padrão baseado na data atual
 */
export function generateDefaultFileName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `Untitled-${year}-${month}-${day}-${hours}${minutes}`;
}

/**
 * Salva os elementos do whiteboard em um arquivo .pwb
 */
export async function saveToFile(
  elements: WhiteboardElement[],
  filename: string
): Promise<void> {
  const fileData: WhiteboardFile = {
    version: '1.0',
    elements,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  const json = JSON.stringify(fileData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pwb') ? filename : `${filename}.pwb`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Carrega um arquivo .pwb e retorna os elementos
 */
export async function loadFromFile(file: File): Promise<WhiteboardElement[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const fileData: WhiteboardFile = JSON.parse(text);
        
        if (!fileData.elements || !Array.isArray(fileData.elements)) {
          throw new Error('Invalid file format: missing elements array');
        }
        
        resolve(fileData.elements);
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Abre um diálogo de seleção de arquivo
 */
export function openFileDialog(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pwb';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      resolve(file);
    };
    input.oncancel = () => {
      resolve(null);
    };
    input.click();
  });
}
