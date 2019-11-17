## FILM BACKEND
- REST API for (Film app)[https://github.com/balamou/Film]

## REST ENDPOINTS

<details>
    <summary>GET /login/:username</summary>
    returns user id as an integer
</details>
<details>
    <summary>GET /signup/:username</summary>
    returns user id as an integer 
</details>

<details>
    <summary>GET /shows/:start/:quantity/:language</summary>
    <b>start</b>: starting index of the show<br/>
    <b>quantity</b>: amount of shows to fetch<br/>
    <b>language</b>: language<br/>

    returns {shows: [{id: INT, posterURL?: STRING}], isLast: BOOL}
</details>
<details>
    <summary>GET /movies/:start/:quantity/:language</summary>
    <b>start</b>: starting index of the movie<br/>
    <b>quantity</b> amount of movies to fetch<br/>
    <b>language</b> language<br/>

    returns {shows: [{id: INT, posterURL?: STRING}], isLast: BOOL}
</details>

<details>
    <summary>GET /watched/:userId</summary>
    retuns all watched content (movie or show)
</details>