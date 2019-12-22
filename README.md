# <div align="center">![Film](images/logo.png)</div>
> REST API backend for [Film app](https://github.com/balamou/Film)

## Installation 
- Have homebrew installed ([brew](https://brew.sh))
- [Install pip3](https://pip.pypa.io/en/stable/installing/)
- Clone and `cd` into the repo

```sh
# install dependencies
npm install

# install postgres
brew install postgresql

# start postgres 
brew services start postgresql

# install kinopoiskpy
pip3 install kinopoiskpy

# install timeout_decorator
pip3 install timeout_decorator

# install ffmpeg
brew install ffmpeg

# Get local ip address to put into the app
ipconfig getifaddr en0
```

## REST ENDPOINTS

### Login user
    
Logins a user (if exists) and returns the user's id

* **URL**

    /login/:username

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `username=[string]`
 
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:** `{ userId: 12 }`

* **Error Response:**

    * **Code:** 404 NOT FOUND </br>
    **Content:** `{ error : "User doesn't exist" }`

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