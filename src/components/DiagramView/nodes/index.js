import ObjectNode from './ObjectNode';
import ArrayNode from './ArrayNode';

// Usar una referencia estable con objetos fijos
const NODE_TYPES = Object.freeze({
  objectNode: ObjectNode,
  arrayNode: ArrayNode,
});

export default NODE_TYPES; 