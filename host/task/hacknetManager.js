/** 
 * @param {import("bitburner").NS} ns 
*/
export async function main(ns) {

    /**
     * Esto podria ser mas efectivo al inicio si calculase de 3 en 3 nodos, para maximizar la ganancia inicial
     * (15k por nodo en el caso actual)
     */
    
    const presupuesto = 1000000; //Considerando que queremos que hacknet sea rentable...

    while(true){

        let costo = ns.hacknet.getPurchaseNodeCost();
        if(costo < presupuesto)
            if(costo <= ns.getMoneySources().sinceInstall.total)
                ns.hacknet.purchaseNode();
            
        let N = ns.hacknet.numNodes();
        for(let I = 0; I < N; I++){
            ns.hacknet.upgradeRam(I, 6); //La ram siempre es viable pues no llega a costar mas de 5m (*6) y es el nucleo principal de la produccion

            if(ns.hacknet.getNodeStats(I).ram == 64){

                let costoLvl = ns.hacknet.getLevelUpgradeCost(I);
                let costoCore = ns.hacknet.getCoreUpgradeCost(I);

                if(costoLvl <= presupuesto / 5) //No vale tanto la pena
                    ns.hacknet.upgradeLevel(I);

                if(costoCore <= presupuesto * 2) //Todavia vale la pena
                    ns.hacknet.upgradeCore(I);
            }
        }

        await ns.sleep(1);
    }
}