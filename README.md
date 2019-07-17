# AnyGIS Mapshoter

Load vector online-map. Take screenshot. Return PNG tile.


## API

https://{s}-mapshoter.herokuapp.com/{mode}/{x}/{y}/{z}/{crossZoom}?script={script}

x, y, z - Coordinates of tile
crossZoom - The zoom level below which the standard OpenStreetMap map will be displayed.
script - Clarifying information used in the URL

Example:
https://a-mapshoter.herokuapp.com/overpass/9900/5133/14/15?script=s/KEy
