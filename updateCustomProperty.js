// helper functions

export function getCustomProperty(elem, property) {
  return parseFloat(getComputedStyle(elem).getPropertyValue(property)) || 0;
  // gets elem style from css and gets the property value (data Type: str)
}

export function setCustomProperty(elem, property, value) {
  elem.style.setProperty(property, value);
  // sets the value custom property example --left to 7
}

export function incrementCustomProperty(elem, property, increment) {
  setCustomProperty(
    elem,
    property,
    getCustomProperty(elem, property) + increment
  );
}
