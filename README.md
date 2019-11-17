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
    **start**: starting index of the show
    **quantity**: amount of shows to fetch
    **language**: language

    returns {shows: [{id: INT, posterURL?: STRING}], isLast: BOOL}
</details>
<details>
    <summary>GET /movies/:start/:quantity/:language</summary>
    **start**: starting index of the movie
    **quantity**: amount of movies to fetch
    **language**: language

    returns {shows: [{id: INT, posterURL?: STRING}], isLast: BOOL}
</details>

<details>
    <summary>GET /watched/:userId</summary>
    retuns all watched content (movie or show)
</details>