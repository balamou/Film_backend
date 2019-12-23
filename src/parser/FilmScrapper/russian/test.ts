import RussianFetcher from "./RussianFetcher";

function test() {
    try {
        const fetcher = new RussianFetcher();
        console.log(fetcher.fetchSeries("american dad"));
        console.log(fetcher.fetchSeries("breaking bad"));
        console.log(fetcher.fetchSeries("friends"));
        console.log(fetcher.fetchSeries("game of thrones"));
        console.log(fetcher.fetchSeries("lost"));
    } catch (error) {
        const pythonError = (error as Error).message;
        console.log(pythonError);
    }
}

test();