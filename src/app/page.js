"use client"
import { cargarGrafoRDF, descargarArchivo, esSimetricoSKOS, generarColecciones, generarListaConceptos } from '@/components/utils';
import { useState, useEffect } from 'react';

export default function Home() {
  const [archivoSubido, setArchivoSubido] = useState(null);
  const [grafo, setGrafo] = useState(null);
 

  const handleFileChange = (event) => {
   
    const file = event.target.files[0];

    if (file) {
     if(!file.name.includes(".rdf")){
      alert("El archivo no es un archivo RDF válido");
      return;
     } 
    setArchivoSubido(file);
    }
  };

  const manVerificarSimetria =async()=> {
   

   esSimetricoSKOS(grafo) ?
       alert("El grafo es simétrico")
    : alert("El grafo no es simétrico")
    
  }

  const manGenerarColeccion =()=> {

   const {archivoXMLSalida, resultadoXML} =  generarColecciones(grafo) 

   descargarArchivo(resultadoXML, archivoXMLSalida)
    
  }

  const manGenerarLista =()=> {

    const {archivoXMLSalida, resultadoXML} =  generarListaConceptos(grafo) 
 
    descargarArchivo(resultadoXML, archivoXMLSalida)
     
   }

  useEffect(() => {
   archivoSubido &&
   leerContenidoArchivo(archivoSubido)
  .then(contenido => {
    setGrafo(cargarGrafoRDF(contenido)) 

  })
  .catch(error => {
    alert(error.message)
    setArchivoSubido(false)
    console.error(error.message);
  })
  }, [archivoSubido])

  function leerContenidoArchivo(inputFile) {
    return new Promise((resolve, reject) => {
      // Obtén el primer archivo seleccionado
      const archivo = inputFile;
  
      // Verifica si se seleccionó un archivo
      if (!archivo) {
        reject(new Error('No se seleccionó ningún archivo.'));
        return;
      }
  
      // Crea una instancia de FileReader
      const lector = new FileReader();
  
      // Configura el evento de carga del archivo
      lector.onload = function (evento) {
        // El contenido del archivo estará en el resultado (result) del lector
        const contenido = evento.target.result;
        resolve(contenido);
      };
  
      // Configura el evento de error del archivo
      lector.onerror = function (error) {
        reject(new Error('Error al leer el archivo.'));
      };
  
      // Lee el contenido del archivo como texto
      lector.readAsText(archivo);
    });
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      
<div className="mx-auto  max-w-xxl">
  <h1 className="mx-auto font-bold mb-5 text-xl  ">Convertidor de archivo RDF a XML</h1>
  <label htmlFor="example5" className="mb-1 block text-sm font-medium text-gray-900">{archivoSubido && !grafo ? "Cargando Grafo:  " : grafo ? "Archivo Subido: " : " Subir Archivo"}{archivoSubido && " " + archivoSubido.name} </label>
  <label className={`flex w-full  transition-colors duration-750 ${archivoSubido && "bg-sky-400"}  cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-sky-400 p-6 transition-all hover:border-primary-300`}>
    <div className="space-y-1  text-center">
      <div className={`mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full ${archivoSubido ? "bg-white" : "bg-sky-400"} `}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6 text-gray-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
      </div>
      <div className="text-gray-600"><a href="#" className="font-medium text-primary-500  transition duration-1000 ease-in-out  hover:text-primary-700">{archivoSubido && !grafo ? "Cargando Grafo" : grafo ? "Archivo Subido" : " Click para subir"} </a> {!archivoSubido &&  "o arrastra y suelta"}</div>
      <p className="text-sm text-gray-500">RDF</p>
    </div>
    <input disabled={archivoSubido} onChange={(e)=> handleFileChange(e)} id="example5" type="file" className="sr-only" />
    </label>
  
   
</div>
<button
  type="button"
  onClick={manVerificarSimetria}
  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
  Verificar Simetría
</button> 
<button
  type="button"
  onClick={manGenerarColeccion}
  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
  Generar Colecciones
</button>

<button
  type="button"
  onClick={manGenerarLista}
  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
 Generar Lista Conceptos
</button>

    </main>
  )
}
