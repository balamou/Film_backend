# <div align="center">![Film](images/logo.png)</div>
> REST API backend for [Film app](https://github.com/balamou/Film)

## Installation 
- To install on **raspberry pi** follow this [guide](/INSTALL_PI.md)

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

<details>
    <summary></summary>
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

</details>

### Sign up user

<details>
    <summary></summary>
Creates a user (if doesn't exist) and return new user's id

* **URL**

    /signup/:username

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `username=[string]`
 
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:** `{ userId: 12 }`

</details>

### Get shows

<details>
    <summary></summary>
Get a list of shows 

* **URL**

    /shows/:start/:quantity/:language

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `start=[int]` id of the first show to fetch</br>
  `quantity=[int]` number of shows to fetch after the `start` id</br>
  `language=[string]` can be 'en' (aslo 'english') or 'ru' (also 'russian') </br>
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:** `{ showData: { id: number, posterURL?: string }[], isLast: boolean } }` </br>
    **Example:** `{ showsData: [{ id: 20, posterURL: "en/shows/rick_and_morty/poster.jpeg" },` </br> `{id: 21, posterURL:"en/shows/south_park/poster.jpeg" }], isLast: true }`

</details>

### Get show

<details>
    <summary></summary>
Get information about a show 

* **URL**

    /show/:showId/:userId

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `showId=[int]` id of the show</br>
  `userId=[int]` the user id who is watching (this is to get `stopped at` position for each episode) </br>
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:** 
    ```ts {
    series: {
                id: number, 
                title: string, 
                seasonSelected: number, 
                totalSeasons: number, 
                description?: string, 
                posterURL?: string, 
                lastWatchedEpisode: <SAME_AS_EPISODES>  
            },
    episodes: {
                id: number, 
                episodeNumber: number, 
                seasonNumber: number, 
                videoURL: string, 
                duration: number,
                thumbnailURL?: string,
                title?: string,
                plot?: string,
                stoppedAt?: number
            }[],
    availableSeasons: number[]
    }
    ```
    <details>
        <summary>Example response in YAML:</summary>

    ```yaml
    series:
      id: 20
      title: Рик и Морти
      seasonSelected: 1
      totalSeasons: 4
      description: 'В центре сюжета — школьник по имени Морти и его дедушка Рик. Морти
        — самый обычный мальчик, который ничем не отличается от своих сверстников. А вот
        его дедуля занимается необычными научными исследованиями и зачастую полностью
        неадекватен. Он может в '
      posterURL: en/shows/rick_and_morty/poster.jpeg
      lastWatchedEpisode:
        id: 223
        seriesId: 20
        seasonNumber: 1
        episodeNumber: 1
        videoURL: en/shows/rick_and_morty/S1/E1.mp4
        duration: 1321
        thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E1.png
        title: Пилотная серия
        plot: 
    episodes:
    - id: 223
      episodeNumber: 1
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E1.mp4
      duration: 1321
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E1.png
      title: Пилотная серия
      plot: 
      stoppedAt: 
    - id: 226
      episodeNumber: 2
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E2.mp4
      duration: 1318
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E2.png
      title: Пёс-газонокосильщик
      plot: 
      stoppedAt: 
    - id: 227
      episodeNumber: 3
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E3.mp4
      duration: 1315
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E3.png
      title: Анатомический парк
      plot: 
      stoppedAt: 
    - id: 228
      episodeNumber: 4
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E4.mp4
      duration: 1265
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E4.png
      title: М. Найт Шьямал-Инопланетяне!
      plot: 
      stoppedAt: 
    - id: 229
      episodeNumber: 5
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E5.mp4
      duration: 1269
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E5.png
      title: Мисикс и разрушение
      plot: 
      stoppedAt: 
    - id: 230
      episodeNumber: 6
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E6.mp4
      duration: 1288
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E6.png
      title: Напиток Рика №9
      plot: 
      stoppedAt: 
    - id: 231
      episodeNumber: 7
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E7.mp4
      duration: 1321
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E7.png
      title: Воспитание Газорпазорпа
      plot: 
      stoppedAt: 
    - id: 232
      episodeNumber: 8
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E8.mp4
      duration: 1335
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E8.png
      title: Скандалы, Рик и расследования
      plot: 
      stoppedAt: 
    - id: 233
      episodeNumber: 9
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E9.mp4
      duration: 1340
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E9.png
      title: Надвигается нечто риканутое
      plot: 
      stoppedAt: 
    - id: 224
      episodeNumber: 10
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E10.mp4
      duration: 1347
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E10.png
      title: Близкие риконтакты риковой степени
      plot: 
      stoppedAt: 
    - id: 225
      episodeNumber: 11
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E11.mp4
      duration: 1341
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E11.png
      title: Риксованный бизнес
      plot: 
      stoppedAt: 
    availableSeasons:
    - 1
    - 2
    - 3
    ```
    </details>

</details>

### Get episodes

<details>
    <summary></summary>
Returns episodes corresponding to a specific season in a show

* **URL**

    /episodes/:seriesId/:userId/:season

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `seriesId=[number]` show id </br>
  `userId=[number]` user id (this is used to get `stopped at` position for each episode) </br>
  `season=[number]` season number  
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:** 
    ```ts
    { 
        id: number;
        episodeNumber: number;
        seasonNumber: number;
        videoURL: string;
        duration: number;
        thumbnailURL?: string;
        title?: string;
        plot?: string;
        stoppedAt?: number; 
    }[]
    ``` 
    <details>
        <summary>Example response in YAML</summary>

    ```yaml
    - id: 223
      episodeNumber: 1
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E1.mp4
      duration: 1321
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E1.png
      title: Пилотная серия
      plot: 
      stoppedAt: 
    - id: 226
      episodeNumber: 2
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E2.mp4
      duration: 1318
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E2.png
      title: Пёс-газонокосильщик
      plot: 
      stoppedAt: 
    - id: 227
      episodeNumber: 3
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E3.mp4
      duration: 1315
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E3.png
      title: Анатомический парк
      plot: 
      stoppedAt: 
    - id: 228
      episodeNumber: 4
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E4.mp4
      duration: 1265
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E4.png
      title: М. Найт Шьямал-Инопланетяне!
      plot: 
      stoppedAt: 
    - id: 229
      episodeNumber: 5
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E5.mp4
      duration: 1269
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E5.png
      title: Мисикс и разрушение
      plot: 
      stoppedAt: 
    - id: 230
      episodeNumber: 6
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E6.mp4
      duration: 1288
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E6.png
      title: Напиток Рика №9
      plot: 
      stoppedAt: 
    - id: 231
      episodeNumber: 7
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E7.mp4
      duration: 1321
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E7.png
      title: Воспитание Газорпазорпа
      plot: 
      stoppedAt: 
    - id: 232
      episodeNumber: 8
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E8.mp4
      duration: 1335
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E8.png
      title: Скандалы, Рик и расследования
      plot: 
      stoppedAt: 
    - id: 233
      episodeNumber: 9
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E9.mp4
      duration: 1340
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E9.png
      title: Надвигается нечто риканутое
      plot: 
      stoppedAt: 
    - id: 224
      episodeNumber: 10
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E10.mp4
      duration: 1347
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E10.png
      title: Близкие риконтакты риковой степени
      plot: 
      stoppedAt: 
    - id: 225
      episodeNumber: 11
      seasonNumber: 1
      videoURL: en/shows/rick_and_morty/S1/E11.mp4
      duration: 1341
      thumbnailURL: en/shows/rick_and_morty/S1/thumbnails/E11.png
      title: Риксованный бизнес
      plot: 
      stoppedAt:
    ```

    </details>

</details>


### Get movies

<details>
    <summary></summary>
Returns a list of movies

* **URL**

    /movies/:start/:quantity/:language

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
    `start=[int]` id of the first movie to fetch </br>
    `quantity=[int]` number of movies to fetch after the start id </br>
    `language=[string]` can be 'en' (aslo 'english') or 'ru' (also 'russian') 
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:** `{ movies: { id: number, posterURL?: string }[], isLast: boolean }`

</details>

### Get movie

<details>
    <summary></summary>
Get movie information based on id

* **URL**

    /movie/:movieId/:userId

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `movieId=[number]` </br>
  `userId=[number]`
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:**

    ```ts
    {
        id: number;
        title: string;
        duration: number;
        videoURL: string;
        description?: string;
        poster?: string;
        stoppedAt?: number;
    }
    ```

</details>

### Get last watched movies and shows

<details>
    <summary></summary>
Get last watched movies or shows

* **URL**

    /watched/:userid

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `userId=[number]`
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:**

    ```ts
    ({
        id: number; // movie id
        duration: number;
        stoppedAt: number;
        label: string;
        videoURL: string;
        type: 'movie';
        posterURL?: string;
    } |  {
        id: number; // show id
        duration: number;
        stoppedAt: number;
        label: string;
        videoURL: string;
        type: 'show';
        showId: number;
        posterURL?: string;
    })[]
    ```

</details>


### Get video info

<details>
    <summary></summary>
Get video info such as when to skip intro or move to the next episode

* **URL**

    /video_info/:episodeId

* **Method:**
    
    `GET`
    
* **URL Params**

  **Required:**
 
  `episodeId=[number]`
 
* **Success Response:**

    * **Code:** 200 </br>
    **Content:**

    ```ts
    {
        name: string; // name displayed on the label: 'Skip intro'/'Skip to end scene' or 'Next episode'
        action: 'skip' | 'next episode';
        from: number; // timestamp at which to display the block
        to?: number; // end timestamp to skip to (this is nil for next episode)
    }[]
    ```

</details>