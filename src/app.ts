import RoutesManager from "./routes/RoutesManager";

async function main() {
    const routesManager = new RoutesManager();
    await routesManager.startServer();
    console.log('Server started!');
};

main();