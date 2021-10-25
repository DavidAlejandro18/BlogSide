// @ts-check

function generateUsername(nombre) {
    let date = new Date();
    let time = date.getTime();
    let ultimos4 = String(time).substring(7);
    let nombrePorPalabras = nombre.toLowerCase().split(' ');
    let primeraPalabra = nombrePorPalabras[0];
    let segundaPalabra = '';

    if(nombrePorPalabras.length > 1) {
        segundaPalabra = nombrePorPalabras[1].substring(0,3);
    }

    return "@" + primeraPalabra + segundaPalabra + ultimos4;
}

module.exports = {
    generateUsername
}