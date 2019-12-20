from kinopoisk.movie import Movie
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
    # movie.get_content('posters')

    poster = None
    if len(movie.posters) > 0:
        poster = movie.posters[0]

    return {"title": movie.title,
            "plot": movie.plot,
            "poster": poster}

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
    
    seriesInfo["title"] = movies[0].title # override title (to avoid brackets)
    return { "seriesInfo": seriesInfo, "seasons" :episode_data }

def main():
    title = sys.argv[1]

    try:
        episode_data = get_episode_data(title)
        encoded = json.dumps(episode_data, ensure_ascii=False).encode('utf8')
        print(encoded.decode())
    except Exception as e:
        sys.stderr.write(e)

def test():
    title = sys.argv[1]
    movie_list = Movie.objects.search(title)
    # print(movie_list[0].title)
    first_movie = movie_list[0]

    movie = Movie(id=first_movie.id)
    time.sleep(.100)
    movie.get_content('main_page')
    # print(movie.plot)

    time.sleep(.100)
    movie.get_content('posters')
    # print(movie.posters)

    poster = None
    if len(movie.posters) > 0:
        poster = movie.posters[0]

    x = {"title": first_movie.title,
         "plot": movie.plot,
         "poster": poster}
    
    try:
        encoded = json.dumps(x, ensure_ascii=False).encode('utf8')
        print(encoded.decode())
    except:
        sys.stderr.write("Decoding error")
    # series = MovieSeries(first_movie.id)
    # print(series)

if __name__ == '__main__':
    main()
