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

                if(await atacar(vecino) === true && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(vecino)){
                    servidoresBDD.push({    nombre: vecino,
                                            dineroMaximo: ns.getServerMaxMoney(vecino), 
                                            dineroActual: ns.getServerMoneyAvailable(vecino),
                                            //rootAccess: ns.hasRootAccess(vecino) ? true : false, //Por logica en este punto ya tengo root access
                                            ruta: [...camino, vecino]
                                        });
                                    
                    await atacarVecinos(vecino, [...camino, vecino]);
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

        if(ns.fileExists("BruteSSH.exe", "home"))   puertosRealizados++; ns.brutessh(server);
        if(ns.fileExists("FTPCrack.exe", "home"))   puertosRealizados++; ns.ftpcrack(server);
        if(ns.fileExists("relaySMTP.exe", "home"))  puertosRealizados++; ns.relaysmtp(server);
        if(ns.fileExists("HTTPWorm.exe", "home"))   puertosRealizados++; ns.httpworm(server);
        if(ns.fileExists("SQLInject.exe", "home"))  puertosRealizados++; ns.sqlinject(server);

        if(puertosRealizados < puertosNecesarios)   return false;

        ns.nuke(server);

        return true;
    }

    while(true){
        await atacarVecinos();

        //Actualizar bdd
        ns.write("serversBDD.json", JSON.stringify(servidoresBDD), "w");

        //Actualizar lista de servidores ordenados por su valor 
        let servidoresListados = servidoresBDD.sort((a, b) => b.dineroMaximo - a.dineroMaximo);
        let servidoresListadosTxt = servidoresListados.map(s => `\nServidor: ${s.nombre}
                                                            \nDinero Maximo: ${s.dineroMaximo.toLocaleString()}\nDinero Actual: ${s.dineroActual.toLocaleString()}
                                                            \nRuta: ${s.ruta.map(s => `connect ${s}`).join("; ")}
                                                            \n---------------------------------------------\n`).join("");
        ns.write("servidores-listados.txt", servidoresListadosTxt, "w");

        servidoresVisitados = [ { nombre: "home" } ];
        servidoresBDD = [];
        
        await ns.asleep(1000);
    }



}