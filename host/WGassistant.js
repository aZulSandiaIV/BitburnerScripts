// @ts-nocheck
/** @param {import("bitburner").NS} ns */
export async function main(ns) {
    
    while(true){
        let bdd = JSON.parse(ns.read("serversBDD.json"));

        for(let server of bdd){
            let RAM = ns.getServerMaxRam() - ns.getServerUsedRam(); 

            if(ns.hackAnalyzeChance(server.nombre) <= 0.9){
                let hilos = Math.floor((ns.getServerMaxRam() - ns.getServerUsedRam()) / ns.getScriptRam("w.js"));
                ns.exec("w.js", ns.getHostname(), hilos, server.nombre)
                await ns.sleep(ns.getWeakenTime(server.nombre) + 100);
            }else if(server.dineroActual <= server.dineroMaximo * 0.9){
                let hilos = Math.floor((ns.getServerMaxRam() - ns.getServerUsedRam()) / ns.getScriptRam("g.js"));
                ns.exec("g.js", ns.getHostname(), hilos, server.nombre)
                await ns.sleep(ns.getGrowTime(server.nombre) + 100);
            }

        }

        await ns.asleep(1000);
    }

}