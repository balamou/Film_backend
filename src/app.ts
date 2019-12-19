import RoutesManager from "./routes/RoutesManager";
import cprocess from "child_process";


function getLocalIPAddress() {
    const process = cprocess.spawnSync("ipconfig", ['getifaddr', 'en0'], { encoding: "utf-8" });

    if (process.stderr.length > 0) throw new Error(process.stderr);

    return process.stdout.replace(/\n/, '');
}

async function main() {
    const routesManager = new RoutesManager();
    await routesManager.startServer();

    try {
        const localIpAddress = getLocalIPAddress();
        console.log(`Server started at ${localIpAddress} using port ${routesManager.PORT_NUMBER}`);
    } catch (error) {
        console.log('Server started!');
        console.log(error);
    }
};

main();