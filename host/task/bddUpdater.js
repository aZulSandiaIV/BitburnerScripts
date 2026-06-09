// @ts-nocheck
/** @param {import("bitburner").NS} ns */

export async function main(ns) {
    
    let servidoresVisitados = [ { nombre: "home" } ];
    //Lista de uso exploratorio
    let servidoresBDD = [];
    //Sera una bdd de servidores que ya han sido atacados, no se volveran a atacar, pero si se actualizaran sus datos (dinero, seguridad, etc)
    
    /**
     * @param {string | null | undefined} server
     */
    async function atacarVecinos(server = "home", camino = [server]){
        const vecinos = ns.scan(server);

        if(vecinos.length === 0) return;

        for(const vecino of vecinos){
            if(!servidoresVisitados.some(s => s.nombre === vecino)){
                servidoresVisitados.push({ nombre: vecino });

                if(await atacar(vecino) === true){
                    servidoresBDD.push({    nombre: vecino,
                                            dineroMaximo: ns.getServerMaxMoney(vecino), 
                                            dineroActual: ns.getServerMoneyAvailable(vecino),
                                            //rootAccess: ns.hasRootAccess(vecino) ? true : false, //Por logica en este punto ya tengo root access
                                            ruta: [...camino, vecino]
                                        });
                                    
                    atacarVecinos(vecino, [...camino, vecino]);
                }
            }
        }
    }

    /**
     * @param {string} server 
     * @returns {Promise<boolean>}
     */
    async function atacar(server) {
        const puertosNecesarios = ns.getServerNumPortsRequired(server);
        let puertosRealizados = 0;

        if(ns.fileExists("BruteSSH.exe", "home"))   puertosRealizados++;
        if(ns.fileExists("FTPCrack.exe", "home"))   puertosRealizados++;
        if(ns.fileExists("relaySMTP.exe", "home"))  puertosRealizados++;
        if(ns.fileExists("HTTPWorm.exe", "home"))   puertosRealizados++;
        if(ns.fileExists("SQLInject.exe", "home"))  puertosRealizados++;

        if(puertosRealizados < puertosNecesarios)   return false;

        ns.nuke(server);

        return true;
    }

    while(true){
        await atacarVecinos();

        //Actualizar bdd
        ns.write("serversBDD.txt", JSON.stringify(servidoresBDD), "w");

        //Actualizar lista de servidores ordenados por su valor 
        ns.write("servidores_valiosos.txt", JSON.stringify(servidoresValiosos.sort((a, b) => b.dineroMaximo - a.dineroMaximo)), "w");
    }



}