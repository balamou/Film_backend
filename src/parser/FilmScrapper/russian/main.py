from kinopoisk.movie import Movie
import timeout_decorator # https://pypi.org/project/timeout-decorator/
import time
import json
import sys

# Finds movies matching the title
# returns an object that has `title` and `id` attributes
def find_movies_matching(title):
    return Movie.objects.search(title)

def get_film_info(movie):
    time.sleep(5)
    movie.get_content('main_page')
    time.sleep(8)
    poster = None

    try:
        get_posters(movie)
        if len(movie.posters) > 0:
            poster = movie.posters[0]
    except:
        pass

    return {"title": movie.title,
            "year": movie.year,
            "plot": movie.plot,
            "poster": poster}

@timeout_decorator.timeout(10)
def get_posters(movie):
    movie.get_content('posters')

def parse_episodes(movie):
    time.sleep(10)
    movie.get_content('series') # loading episodes
    seasonNumber = 1
    episodeNumber = 1
    seasons = []

    for season in movie.seasons:
        episodes = []
        for episode in season.episodes:
            episodes.append({"episodeNumber": episodeNumber, "title": episode.title})
            episodeNumber += 1
        
        curr_season = { "seasonNumber": seasonNumber, "episodes": episodes }
        seasons.append(curr_season)
        episodeNumber = 1
        seasonNumber += 1

    return seasons

def get_episode_data(title):
    movies = find_movies_matching(title)
    if len(movies) == 0:
        raise Exception("No shows found with title '%s'" % title) # ERROR
    
    time.sleep(12)
    movie = Movie(id = movies[0].id)
    time.sleep(2)
    seriesInfo = get_film_info(movie)
    time.sleep(8)
    episode_data = parse_episodes(movie)
    
    seriesInfo["title"] = movies[0].title.strip() # override title (to avoid brackets)
    return { "seriesInfo": seriesInfo, "seasons" :episode_data }

def json_stringify(data):
    encoded = json.dumps(data, ensure_ascii=False).encode('utf8')
    return encoded.decode()

def main():
    title = sys.argv[1]

    if sys.argv[1] == '-m': # this block searches for movies only
        title = sys.argv[2]
        try: 
            print(get_movie(title))
            return
        except Exception as e:
            sys.stderr.write(e)

    try:
        episode_data = get_episode_data(title)
        print(json_stringify(episode_data))
    except Exception as e:
        sys.stderr.write(e)


def get_movie(title):
    movies = find_movies_matching(title)
    
    if len(movies) == 0:
        raise Exception("No movies found with title '%s'" % title) # ERROR
    
    time.sleep(12)
    movie = Movie(id = movies[0].id)
    time.sleep(2)
    movieInfo = get_film_info(movie)

    return json_stringify(movieInfo)


if __name__ == '__main__':
    main()
