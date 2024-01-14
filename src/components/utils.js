
import { graph, parse, namedNode } from 'rdflib';
import { Builder } from 'xml2js';


// Función para cargar un grafo RDF desde un archivo
export function cargarGrafoRDF(archivoRDF) {
  // Lee los datos RDF desde el archivo
  const datosRDF = archivoRDF
  
  // Crea un objeto grafo RDF
  const grafo = graph();

  // Configuración de la base URL y tipo de contenido
  const baseUrl = 'http://example.org/';
  const datos = datosRDF.replace(/xmlns="/g, `xmlns="${baseUrl}`);
  const tipoContenido = 'application/rdf+xml';

  // Parsea los datos RDF y carga en el grafo
  parse(datos, grafo, baseUrl, tipoContenido);

  // Devuelve el grafo cargado
  return grafo;
}

// Función para verificar la simetría de relaciones SKOS en un grafo RDF
export function esSimetricoSKOS(grafo) {
  // Obtiene todos los conceptos en el grafo
  const conceptos = grafo.statementsMatching(
    null,
    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    namedNode('http://www.w3.org/2004/02/skos/core#Concept')
  );

  // Itera sobre cada concepto
  for (const concepto of conceptos) {
    // Obtiene los conceptos más específicos relacionados al concepto actual
    const conceptosMasEspecificos = grafo.statementsMatching(
      concepto.subject,
      namedNode('http://www.w3.org/2004/02/skos/core#narrower'),
      null
    );

    // Itera sobre cada concepto más específico
    for (const conceptoMasEspecifico of conceptosMasEspecificos) {
      // Obtiene los conceptos más generales relacionados al concepto más específico
      const conceptosMasGenerales = grafo.statementsMatching(
        conceptoMasEspecifico.object,
        namedNode('http://www.w3.org/2004/02/skos/core#broader'),
        null
      );

      // Verifica si el concepto original es "broader" que su "narrower"
      if (!conceptosMasGenerales.some(masGeneral => masGeneral.object.equals(concepto.subject))) {
        // No es simétrico, retorna falso
        return false;
      }
    }
  }

  // Todas las relaciones "narrower" tienen su contraparte "broader", retorna verdadero
  return true;
}


export function generarListaConceptos(grafo, lenguaje = "es") {

  const archivoXMLSalida = lenguaje === "es" ? 'epigrafe_UCLV_ES.xml' : "epigrafe_UCLV_EN.xml";

  const estructuraXML = {
      'node': {
          '$': {
              'id': 'core#ConceptScheme',
              'label': 'Epígrafe UCLV',
          },
          'isComposedBy': [],
          'hasNote': 'Epígrafe UCLV',
      },
  };

  // Obtener todos los elementos skos:ConceptScheme del grafo RDF
  const esquemaConceptual = grafo.each(
      null,
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/2004/02/skos/core#ConceptScheme')
  );
  const conceptos = grafo.statementsMatching(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/2004/02/skos/core#Concept'));

  esquemaConceptual.forEach(esquema => {

      const estructuraConceptoArr = [];
      conceptos.forEach(concepto => {

          const propiedades = grafo.statementsMatching(
              concepto.subject,
              undefined,
              undefined
          );

          const id = concepto.subject.value;
          const etiqueta = propiedades.find(el => el.predicate.value === "http://www.w3.org/2004/02/skos/core#prefLabel" && el.object.language === lenguaje).object.value;

          const estructuraConcepto = {
              'node': {
                  '$': {
                      'id': id,
                      'label': etiqueta,
                  },
                  'isComposedBy': [],
                  'hasNote': etiqueta
              },
          };

          estructuraConceptoArr.push(estructuraConcepto);
      });
      estructuraXML.node.isComposedBy.push(estructuraConceptoArr);
  })

  // Convertir la estructura en un objeto JSON
  const resultado = estructuraXML;

  // Convertir el objeto JSON en XML
  const constructor = new Builder();
  const resultadoXML = constructor.buildObject(resultado);

  return {
      archivoXMLSalida,
      resultadoXML
  }
}



export function escribirArchivoXML(archivoXMLSalida, xmlResult) {
    fs.writeFileSync(archivoXMLSalida, xmlResult, 'utf8');
    return true;
}

export function generarColecciones(grafo, lenguaje = "es") {

    const archivoXMLSalida = lenguaje === "es" ? 'tesauroES.xml' : "tesauroEN.xml";
  
    // Crear la estructura XML deseada
    const estructuraXML = {
        'node': {
            '$': {
                'id': 'core#ConceptScheme',
                'label': 'http://www.w3.org/2004/02/skos/core#ConceptScheme',
            },
            'isComposedBy': []
        },
    };
  
    // Obtener todos los elementos skos:ConceptScheme del grafo RDF
    const esquemaConceptual = grafo.each(
        null,
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/2004/02/skos/core#ConceptScheme')
    );
  
    // Obtener todos los elementos skos:Collection del grafo RDF
    const colecciones = grafo.statementsMatching(
        null,
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/2004/02/skos/core#Collection')
    );
  
    esquemaConceptual.forEach(() => {
  
        const estaCompuestoPor = [];
  
        const coleccionesFiltradas = colecciones.filter(el => el.subject.value.includes("http://skos.um.es/unescothes/COL0"));
  
        coleccionesFiltradas.forEach((col, i) => {
  
            const propiedades = grafo.statementsMatching(
                col.subject,
                undefined,
                undefined
            );
  
            const id = col.subject.value;
            const etiqueta = propiedades.find(el => el.predicate.value === "http://www.w3.org/2004/02/skos/core#prefLabel" && el.object.language === lenguaje).object.value;
           
  
            const estructuraColeccion = {
                'node': {
                    '$': {
                        'id': id,
                        'label': etiqueta,
                    },
                    'isComposedBy': [],
                    'hasNote': etiqueta
                },
            };
  
            const miembrosColecciones = propiedades.filter(prop => prop.predicate.value.includes("member"));
  
            const estructuraColeccionEstaCompuestoPor = [];
  
            miembrosColecciones.forEach((miembro, i) => {
                const colMiembro = colecciones.find(el => el.subject.value === miembro.object.value);
  
                const propiedadesMiembro = grafo.statementsMatching(
                    colMiembro.subject,
                    undefined,
                    undefined
                );
  
                const idMiembro = colMiembro.subject.value;
                const etiquetaMiembro = propiedadesMiembro.find(el => el.predicate.value === "http://www.w3.org/2004/02/skos/core#prefLabel" && el.object.language === lenguaje)?.object.value;
  
                const estructuraSubColeccion = {
                    'node': {
                        '$': {
                            'id': idMiembro,
                            'label': etiquetaMiembro,
                        },
                        'isComposedBy': [],
                        'hasNote': etiquetaMiembro
                    },
                };
                
               
                const subPropiedades = grafo.statementsMatching(
                  colMiembro.subject,
                  undefined,
                  undefined
              );
                const miembrosSubColecciones = subPropiedades.filter(prop => prop.predicate.value.includes("member"));
  
                const estructuraSubColeccionEstaCompuestoPor = [];
                const concepts = grafo.statementsMatching(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/2004/02/skos/core#Concept'));

                miembrosSubColecciones.forEach((subMiembro,i)=>{
                  const colSubMiembro = concepts.find((el,i) => 
                   
                    el.subject.value === subMiembro.object.value
                );
                  
                   
                  const propiedadesMiembro = grafo.statementsMatching(
                      colSubMiembro?.subject,
                      undefined,
                      undefined
                  );
  
                  const idMiembro = colSubMiembro?.subject.value;
                const etiquetaMiembro = propiedadesMiembro.find(el => el.predicate.value === "http://www.w3.org/2004/02/skos/core#prefLabel" && el.object.language === lenguaje)?.object.value;
  
                const estructuraSub2Coleccion = {
                  'node': {
                      '$': {
                          'id': idMiembro,
                          'label': etiquetaMiembro,
                      },
                      'isComposedBy': [],
                      'hasNote': etiquetaMiembro
                  },
              };
              estructuraSubColeccionEstaCompuestoPor.push(estructuraSub2Coleccion)
                })
                estructuraSubColeccion.node.isComposedBy.push(estructuraSubColeccionEstaCompuestoPor)
                estructuraColeccionEstaCompuestoPor.push(estructuraSubColeccion);
            });
            estructuraColeccion.node.isComposedBy.push(estructuraColeccionEstaCompuestoPor);
            estaCompuestoPor.push(estructuraColeccion);
        });
  
        estructuraXML.node.isComposedBy.push(estaCompuestoPor);
    })
  
    // Convertir la estructura en un objeto JSON
    const resultado = estructuraXML;
  
    // Convertir el objeto JSON en XML
    const constructor = new Builder();
    const resultadoXML = constructor.buildObject(resultado);
  
    return {
        archivoXMLSalida,
        resultadoXML
    }
  
  }

  export function descargarArchivo(contenido, nombreArchivo) {
    // Crea un Blob con el contenido del archivo
    const blob = new Blob([contenido], { type: 'text/xml' });
  
    // Crea un enlace <a> para simular la descarga
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.href = window.URL.createObjectURL(blob);
    enlaceDescarga.download = nombreArchivo;
  
    // Añade el enlace al documento
    document.body.appendChild(enlaceDescarga);
  
    // Simula un clic en el enlace para iniciar la descarga
    enlaceDescarga.click();
  
    // Elimina el enlace del documento
    document.body.removeChild(enlaceDescarga);
  }
  

  


