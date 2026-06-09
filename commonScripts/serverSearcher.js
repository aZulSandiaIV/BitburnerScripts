/** @param {import("bitburner").NS} ns */
export async function main(ns) {
    
    const variable = ns.fileExists("serversBDD.json") ? ns.scp("serversBDD.json", ns.getHostname(), "home") : false;
    if (variable === false) return;
    const buscado = ns.args[0];
    const bdd = JSON.parse(ns.read("serversBDD.json"));
    let flag = 0;

    for(let server of bdd){
        if(server.nombre.includes(buscado)){
            // @ts-ignore
            ns.tprint(`\n\t${server.nombre}\n\t${server.ruta.map(s => `connect ${s}`).join("; ")}\n`);

            flag++;
        }
    }
    if(!flag) ns.tprint("servidor no alistado");
}