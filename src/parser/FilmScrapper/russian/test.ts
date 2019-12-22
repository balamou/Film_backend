import RussianFetcher from "./RussianFetcher";

function test() {
    try {
        const fetcher = new RussianFetcher();
        console.log(fetcher.fetchSeries("Ted Bundy"));
        console.log(fetcher.fetchEpisode("Homeland", 2, 10));
    } catch (error) {
        const pythonError = (error as Error).message;
        console.log(pythonError);
    }
}

test();