import RussianFetcher from "./RussianFetcher";

function test() {
    try {
        const fetcher = new RussianFetcher();
        console.log(fetcher.fetchSeries("Dexter"));
        console.log(fetcher.fetchEpisode("rick and morty", 2, 10));
    } catch (error) {
        const pythonError = (error as Error).message;
        console.log(pythonError);
    }
}

test();