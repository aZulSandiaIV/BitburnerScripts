// @ts-nocheck
/** @param {import("bitburner").NS} ns */
export async function main(ns) {
    
    while(true){
        let bdd = JSON.parse(ns.read("serversBDD.json"));

        for(let server of bdd){
            let RAM = ns.getServerMaxRam() - ns.getServerUsedRam(); 

            if(ns.hackAnalyzeChance(server.nombre) <= 0.75){
                while(RAM >= ns.getScriptRam("w.js", "home")){
                    ns.exec("w.js", ns.getHostname(), 1, server.nombre);
                    RAM -= ns.getScriptRam("w.js", "home");
                }
                await ns.sleep(ns.getWeakenTime(server.nombre) + 100);
            }else if(server.dineroActual <= server.dineroMaximo * 0.75){
                while(RAM >= ns.getScriptRam("g.js", "home")){
                    ns.exec("g.js", ns.getHostname(), 1, server.nombre);
                    RAM -= ns.getScriptRam("g.js", "home");
                }
                await ns.sleep(ns.getGrowTime(server.nombre) + 100);
            }

        }

        await ns.asleep(1000);
    }

}