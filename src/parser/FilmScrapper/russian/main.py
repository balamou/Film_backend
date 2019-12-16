#!/usr/bin/python3
from kinopoisk.movie import Movie

movie_list = Movie.objects.search('breaking bad')
print(movie_list[0].title)
