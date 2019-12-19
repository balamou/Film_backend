from kinopoisk.movie import Movie
import time
import json
import sys

def main():
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
