/** @param {import("bitburner").NS} ns */
export async function main(ns) {
    const target = ns.args.length > 0 ? String(ns.args[0]) : undefined;
    await ns.hack(target);
}