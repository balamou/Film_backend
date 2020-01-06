# TODO

[ ] Removes episodes if one of them threw an error
[X] Take dir tree difference and apply it to the database (update-dir-changes)
[X] Cache english imdb fetcher (cache-english-imdb)
[ ] Parse movies folder
[ ] Try to get the parser to work with sym links to folders
[ ] Make movies REST API
[X] Subdivide russian series parser to parse the right folder 
[ ] Add queries for updating last_viewed episode and watched
[ ] Add colors to the console (https://www.npmjs.com/package/colors)

[ ] Reorginize the parsing architecture
[ ] Unit test the parsing code

[ ] Create a client-side web for displaying parsed data

[X] Crop strings if they are too big for a database entry
[ ] Add episodes to the database as a batch and not one by one

## Clean up
[ ] Move all excludes to one main variable
[ ] Set all dependencies in the constructor