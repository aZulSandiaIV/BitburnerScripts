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
        let informesOrdenados = informes;
        informesOrdenados.sort((s1, s2) => s1.passwordLength - s2.passwordLength);

        const informesNuevos = informesOrdenados.filter(informe => ns.isRunning("timmy.js", informe.nombre));

        if(informesNuevos[0].passwordLength !== 0){

            const informesFiltrados = informesNuevos.filter(informe => informe.model in ["FreshInstall_1.0","DeskMemo_3.1"]);

            return informesFiltrados[0];
        }

        return informesNuevos[0];
    }

    /** @param {informe} objetivo */
    async function atacarMemo(objetivo){

        let max = parseInt("9".repeat(objetivo.passwordLength));
        let crackeado = { success: false };
        let isOnline = ns.dnet.getServerDetails(objetivo.nombre).isOnline;

        for(let I = 0; I <= max && isOnline; I++){
            let intento = I.toString().padStart(length, "0");
            crackeado = await ns.dnet.authenticate(objetivo.nombre, intento);
            
            if(crackeado.success){

                const informe = {
                    nombre: objetivo,
                    password: intento
                };

                ns.write(`informe-${objetivo}.json`, JSON.stringify(informe), "w");
                //Los recolectare luego con una tarea aparte para ahorrar memoria
                return crackeado.success;
            } 

            isOnline = ns.dnet.getServerDetails(objetivo.nombre).isOnline;
        }

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

    /** @param {string} objetivo */
    function infectar(objetivo){
        ns.scp("timmy.js", objetivo);
        ns.exec("timmy.js", objetivo);
    }

    while(true){

        let vecinos = ns.dnet.probe();
        let informes = Object.create(informe);

        informes = vecinos.forEach(vecino => {
            let vecinoDetalles = ns.dnet.getServerDetails(vecino)
            informes.nombre = vecino;
            informes.passwordLength = vecinoDetalles.passwordLength;
            informes.type = vecinoDetalles.passwordFormat;
            informes.model = vecinoDetalles.modelId;
        });

        let objetivo = ataqueOptimo(informes);
        let success;

        switch (objetivo.model){
            case "FreshInstall_1.0":
                success = await atacarFresh(objetivo);
            
            case "DeskMemo_3.1":
                success = await atacarMemo(objetivo);
        }

        if(success === true){
            infectar(objetivo.nombre);
        }

        await ns.sleep(1000);
    }

}