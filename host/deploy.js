/** @param {NS} ns */
export async function main(ns) {

    const servidoresVisitados = new Set();
    let reporteRutasValiosas = []; //"=== SERVIDORES MÁS VALIOSOS Y SUS RUTAS ===\n\n";
    let reporteRutas = []; // "=== SERVIDORES Y SUS RUTAS ===\n\n";
    let contServ = 0;

    //De no pasar un valor cargo todos los servidores al archivo "servidores_valiosos.txt"
    const UMBRAL_DINERO_VALIOSO = 1000000;
  
    async function attack(server) {
        //const server = ns.args[0];
        const puertosNecesarios = ns.getServerNumPortsRequired(server);
        let puertosRealizados = 0;

        ns.tprint("Atacando... " + server);

        if(ns.fileExists("BruteSSH.exe", "home")){
            ns.brutessh(server);
            ns.tprint(server + ": BruteSSH.exe realizado");
            puertosRealizados++;
        }else{
            ns.tprint(server + ": No se pudo realizar o no existe BruteSSH.exe");
        }
            if(ns.fileExists("FTPCrack.exe", "home")){
            ns.ftpcrack(server);
            ns.tprint(server + ": FTPCrack.exe realizado");
            puertosRealizados++;
        }else{
            ns.tprint(server + ": No se pudo realizar o no existe BruteSSH.exe");
        }
        if(ns.fileExists("relaySMTP.exe", "home")){
            ns.relaysmtp(server);
            ns.tprint(server + ": relaySMTP.exe realizado");
            puertosRealizados++;
        }else{
            ns.tprint(server + ": No se pudo realizar o no existe BruteSSH.exe");
        }
            if(ns.fileExists("HTTPWorm.exe", "home")){
            ns.httpworm(server);
            ns.tprint(server + ": HTTPWorm.exe realizado");
            puertosRealizados++;
        }else{
            ns.tprint(server + ": No se pudo realizar o no existe BruteSSH.exe");
        }

        if(puertosRealizados < puertosNecesarios){
            ns.tprint(server + ": Puertos insuficientes para realizar NUKE.exe");
            return 0;
        }

        if(puertosRealizados >= puertosNecesarios){
            ns.nuke(server);
            ns.tprint(server + ": NUKE.exe realizado\n");
        }else{
            ns.tprint(server + ": NUKE.exe no se pudo realizar\n");
        }

        return 1;
    }


    async function attackNeighbors(servidorActual, caminoActual = []) {

        servidoresVisitados.add(servidorActual);
        const servidoresVecinos = ns.scan(servidorActual);
        //ns.tprint(rightLevel);

        if (servidoresVecinos.length === 0) {
            //ns.tprint(leftLevel + "No tiene conexiones nuevas");
            return 0;
        }
        
        for (let server of servidoresVecinos) {

            if(servidoresVisitados.has(server)){
                continue;
            }

            const nuevaRuta = [...caminoActual, server];

            const dineroMaximo = ns.getServerMaxMoney(server);
            const dineroActual = ns.getServerMoneyAvailable(server);

            let hackLvl = ns.getHackingLevel();
            let hackLvlRequired = ns.getServerRequiredHackingLevel(server);

            if(hackLvl >= hackLvlRequired){
                
                if(!ns.hasRootAccess(server)){
                    await attack(server);
                    //ns.tprint("");
                }
                
                if(ns.hasRootAccess(server)){

                    // Si es apto se añade a "servidores_valiosos.txt"
                    if (dineroMaximo >= UMBRAL_DINERO_VALIOSO) {

                        const comandosConnect = nuevaRuta
                        .filter(s => s !== "home")
                        .map(s => `connect ${s}`)
                        .join("; ");

                        reporteRutasValiosas.push({
                        nombre: server,
                        dineroMaximo: dineroMaximo,
                        dineroActual: dineroActual,
                        ruta: `home; ${comandosConnect}`
                        });
                    }
                    
                    // Si es apto se añade a "servidores.txt"
                    const comandosConnect = nuevaRuta
                        .filter(s => s !== "home")
                        .map(s => `connect ${s}`)
                        .join("; ");

                    reporteRutas.push({
                        nombre: server,
                        ruta: `home; ${comandosConnect}`
                    });

                    contServ++;
                }

                await attackNeighbors(server, nuevaRuta);

            }else{
                ns.tprint(`${server}: nivel de hackeo insuficiente.\n  `);
            }
        }
    
        return 1;
    }
  
    await attackNeighbors( "home" );

    reporteRutasValiosas.sort((a, b) => b.dineroMaximo - a.dineroMaximo);
    let archivoValiososTemp = "=== SERVIDORES MÁS VALIOSOS Y SUS RUTAS ===\n\n";
    for (let serv of reporteRutasValiosas) {
        archivoValiososTemp += `[${serv.nombre}]\n`;
        archivoValiososTemp += `- Dinero Máximo: $${serv.dineroMaximo.toLocaleString()}\n`;
        archivoValiososTemp += `- Dinero Actual: $${serv.dineroActual.toLocaleString()}\n`;
        archivoValiososTemp += `- Ruta: ${serv.ruta}\n`;
        archivoValiososTemp += `--------------------------------------------------\n`;
    }
    await ns.write("servidores_valiosos.txt", archivoValiososTemp, "w");

    let archivoTemp = "=== SERVIDORES Y SUS RUTAS ===\n\n";
    for (let serv of reporteRutas) {
        archivoTemp += `[${serv.nombre}]\n`;
        archivoTemp += `- Ruta: ${serv.ruta}\n`;
        archivoTemp += `--------------------------------------------------\n`;
    }
    await ns.write("servidores.txt", archivoTemp, "w");

    ns.tprint (`\n\n\tNumero de servidores abiertos: ${contServ}` +
                `\n\n\tProceso ${ns.getScriptName()} finalizado...\n\n`);

}