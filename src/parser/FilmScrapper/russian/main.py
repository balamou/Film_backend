from kinopoisk.movie import Movie
import time

def main():
    movie_list = Movie.objects.search('Rick and morty')
    print(movie_list[0].title)
    first_movie = movie_list[0]

    movie = Movie(id=first_movie.id)
    time.sleep(.300)
    movie.get_content('main_page')
    print(movie.plot)

    time.sleep(.300)
    movie.get_content('posters')
    print(movie.posters)

if __name__ == '__main__':
    main()
