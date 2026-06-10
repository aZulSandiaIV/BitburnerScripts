// @ts-nocheck
/** @param {import("bitburner").NS} ns */
export async function main(ns) {
    
    while(true){
        let bdd = JSON.parse(ns.read("serversBDD.json"));

        for(let server of bdd){
            let RAM = ns.getServerMaxRam(server.nombre) - ns.getServerUsedRam(server.nombre); 

            if(ns.hackAnalyzeChance(server.nombre) > 0.9){
                ns.scp("w.js", server.nombre, "home");

                while(RAM >= ns.getScriptRam("w.js", "home")){
                    ns.exec("w.js", server.nombre, 1);
                    RAM -= ns.getScriptRam("w.js", "home");
                }

            }else if(server.dineroActual >= server.dineroMaximo * 0.75){
                ns.scp("g.js", server.nombre, "home");

                while(RAM >= ns.getScriptRam("g.js", "home")){
                    ns.exec("g.js", server.nombre, 1);
                    RAM -= ns.getScriptRam("g.js", "home");
                }

            }else if(ns.hackAnalyzeChance(server.nombre) > 0.5){
                ns.scp("h.js", server.nombre, "home");

                while(RAM >= ns.getScriptRam("h.js", "home")){
                    ns.exec("h.js", server.nombre, 1);
                    RAM -= ns.getScriptRam("h.js", "home");
                }
                
            }

        }

        await ns.asleep(1000);
    }

}