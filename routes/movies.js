const router = require("express").Router();

router.get("/movies/:start/:quantity/:language", (req, res, next) => {
    const start = req.params.start;
    const quantity = req.params.quantity;
    const language = req.params.language;

    const moviesData = generateData(req.params.quantity);
    const isLast = (req.params.start + req.params.quantity) > 20;

    res.json({ movies: moviesData, isLast: isLast });
});


const generateData = (quantity) => {
    const posters = ["https://cdn.shopify.com/s/files/1/0191/7850/products/RICKMORTY_39_-_COVER_A_FNL_WEB_1024x.jpg?v=1530034748",
        "https://cdn.shopify.com/s/files/1/0191/7850/products/RICKMORTY_V9_TPB_-_COVER_B_FNL_WEB_1024x.jpg?v=1561666332",
        "https://cdn.shopify.com/s/files/1/0191/7850/products/RICKMORTY_53_-_COVER_A_SOLICIT_WEB_1024x.jpg?v=1566330470",
        "https://cdn.shopify.com/s/files/1/0191/7850/products/RICKMORTY_PRESENTS_V1_-_COVER_B_FNL_WEB_1024x.jpg?v=1559159173",
        "https://cdn.shopify.com/s/files/1/0191/7850/products/RICKMORTY_PRESENTS_V1_-_COVER_A_FNL_WEB_1024x.jpg?v=1559158092",
        "https://cdn.shopify.com/s/files/1/0191/7850/products/RICKMORTY_45_-_COVER_A_SOLICIT_WEB_1024x.jpg?v=1546446607",
        "https://mir-s3-cdn-cf.behance.net/project_modules/disp/2cd7d911377377.560f6bdfb0dab.jpg",
        "https://m.media-amazon.com/images/M/MV5BNWNmYzQ1ZWUtYTQ3ZS00Y2UwLTlkMDctZThlOTJkMGJiNzBiXkEyXkFqcGdeQXVyNjg2NjQwMDQ@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BN2UwNDc5NmEtNjVjZS00OTI5LWE5YjctMWM3ZjBiZGYwMGI2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
        "https://cdn.flickeringmyth.com/wp-content/uploads/2019/02/vice.jpg",
        "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg",
        "https://honeydoze.com/wp-content/uploads/2017/03/the-social-network.jpg",
        "https://images-na.ssl-images-amazon.com/images/I/71dXHCpZAXL._SL1051_.jpg",
        "https://images-na.ssl-images-amazon.com/images/I/81e36u8GzsL._SL1500_.jpg",
        "https://m.media-amazon.com/images/M/MV5BNTEyYmIzMDUtNWMwNC00Y2Q1LWIyZTgtMGY1YzUxOTAwYTAwXkEyXkFqcGdeQXVyMjIyMTc0ODQ@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BMjM3MjQ1MzkxNl5BMl5BanBnXkFtZTgwODk1ODgyMjI@._V1_.jpg"];

    const moviesData = [];

    for (let i = 0; i < quantity; i++) {
        moviesData.push({ id: i, posterURL: posters[(i + 7) % posters.length] });
    }

    return moviesData;
};

module.exports = router;
