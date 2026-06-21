export class informe{
    /**
     * @param {string} nombre
     * @param {string} type
     * @param {string} model
     * @param {number} passwordLength
     */
    constructor(nombre, model, type, passwordLength){
        this.nombre = nombre;
        this.model = model;
        this.type = type;
        this.passwordLength = passwordLength;
    }
}

/**
 * @param {import("bitburner").NS} ns
 */
export async function main(ns) {
  
    
    /** @param {informe[]} informes */
    function ataqueOptimo(informes){
        // CONDICIONAL DE SEGURIDAD: Si no hay informes, salimos antes de que falle
        if (!informes || !Array.isArray(informes) || informes.length === 0) {
            return null;
        }

        let informesOrdenados = Array.from(informes);
        informesOrdenados.sort((s1, s2) => s1.passwordLength - s2.passwordLength);

        const informesNuevos = Array.from(informesOrdenados.filter(informe => !ns.isRunning("timmy.js", informe.nombre)));
        
        if(informesNuevos.length !== 0){
            
            if(informesNuevos[0].passwordLength !== 0){
                if (informesNuevos.length > 0) {
                    return informesNuevos[0];
                }

                return null; 
            }

            // Si la longitud de la contraseña es 0, lo devolvemos directo
            return informesNuevos[0];
        }

        return null;
    }

/** @param {informe} objetivo */
    async function atacarMemo(objetivo){

        let max = parseInt("9".repeat(objetivo.passwordLength));
        let crackeado = { success: false };

        for(let I = 0; I <= max; I++){
            
            // VERIFICACIÓN PREVENTIVA: Consultamos el estado antes de interactuar con la API de login
            let estadoActual = ns.dnet.getServerDetails(objetivo.nombre);
            
            // Si el servidor ya no está online o dejó de existir, abortamos inmediatamente
            if (!estadoActual || !estadoActual.isOnline) {
                // ns.tprint(`ALERTA: Conexión perdida con ${objetivo.nombre}. Abortando ataque.`);
                return false; 
            }

            let intento = I.toString().padStart(objetivo.passwordLength, "0");
            
            // Como ya validamos que está online, ejecutamos de forma segura
            crackeado = await ns.dnet.authenticate(objetivo.nombre, intento);
            
            if(crackeado.success){
                const informeResultado = {
                    nombre: objetivo.nombre, // Cambiado de 'objetivo' (objeto entero) a 'objetivo.nombre' (string)
                    password: intento
                };

                //ns.write(`informe-${objetivo.nombre}.json`, JSON.stringify(informeResultado), "w");
                return true;
            } 
            
            // Añadir un micro-respiro al bucle previene que el juego se congele 
            // por procesar miles de intentos de contraseñas por segundo
            await ns.asleep(1); 
        }

        // Si recorrió todos los números y no crackeó nada, devuelve false de forma explícita
        return false;
    }

    /** Este codigo lo saque de internet para guiarme, derechos para Coolblubird
     * @param {informe} objetivo
     */
    async function atacarFresh(objetivo){

        //debug
        //ns.ui.openTail();
        //ns.print(ns.dnet.getServerDetails(hostname).passwordFormat)
        if(objetivo.type == "alphabetic"){
        var result = await ns.dnet.authenticate(objetivo.nombre, "password");

        //go down the list of known ones
        if(result.success == false){
        result = await ns.dnet.authenticate(objetivo.nombre, "admin");
        }

        return result.success;
        }
        else{ //its numeric
        var result = await ns.dnet.authenticate(objetivo.nombre, "0000");

        //go down the list of known ones
        if(result.success == false){
        result = await ns.dnet.authenticate(objetivo.nombre, "12345");
        }

        return result.success;
        }

    }

    /** Este codigo lo saque de internet para guiarme, derechos para Coolblubird
     * @param {informe} objetivo
     */
    async function atacarBlare(objetivo){
      var password = "";
      const details = ns.dnet.getServerDetails(objetivo.nombre);
      var hint = details.data; //this is the only thing that changes, instead of reading the hint text, we are reading the given data.

      //check each character in the hint
      for(var i = 0; i< hint.length; i++){
        var char = hint[i];
        //if that value is a number, then add it
        if(/^\d$/.test(char)){
          password = password + char;
        }
      }

      const result = await ns.dnet.authenticate(objetivo.nombre, password);
      ns.print(password);
      return result.success;
    }

    /** @param {string} objetivo */
    function infectar(objetivo){
        ns.scp("timmy.js", objetivo);
        ns.exec("timmy.js", objetivo);
    }

    while(true){
        let cache = ns.ls(ns.getHostname(), '.cache'); //Esta funcion si puede ser dirigida!
        if(cache.length !== 0){
            for(let file of cache){
                ns.tprint(ns.dnet.openCache(file).message);
            }
        }

        await ns.dnet.memoryReallocation(); //Esta funcion si puede ser dirigida!


        let vecinos = ns.dnet.probe();

        // 1. Conseguimos los detalles, pero filtramos CUALQUIER vecino que falle
        let informes = vecinos
            .map(vecino => {
                let vecinoDetalles = ns.dnet.getServerDetails(vecino);
                
                // Si la API del juego no devuelve detalles de este vecino, ignoramos el objeto
                if (!vecinoDetalles) return null; 

                return {
                    nombre: vecino,
                    passwordLength: vecinoDetalles.passwordLength,
                    type: vecinoDetalles.passwordFormat,
                    model: vecinoDetalles.modelId
                };
            })
            // 2. TRUCO DE ORO: Eliminamos los elementos 'null' de la lista
            .filter(informe => informe !== null); 

        // Ahora, 'informes' está 100% limpio. Si no hay vecinos válidos, será un array vacío []
        let objetivo = ataqueOptimo(informes);
        let success = false; 

        // Solo atacamos si ataqueOptimo encontró un objetivo real y válido
        if (objetivo !== null && objetivo !== undefined) { 
            
            switch (objetivo.model) {
                case "FreshInstall_1.0":
                    success = await atacarFresh(objetivo);
                    break;
                
                case "DeskMemo_3.1":
                    success = await atacarMemo(objetivo);
                    break; 
                case "CloudBlare(tm)":
                    success = await atacarBlare(objetivo);
                    break;
                default:
                    success = (await ns.dnet.authenticate(objetivo.nombre, "")).success;
            }
            if(objetivo.type == "numeric" && success === false){
                success = await atacarMemo(objetivo);
            }

            if(success === true){
                infectar(objetivo.nombre);
            }
        }

        await ns.sleep(1000);
    }

}