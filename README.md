# AnyGIS Mapshoter

Load vector online-map. Take screenshot. Return PNG tile.


### API

```
https://anygis.herokuapp.com/mapshoter/{mode}/{x}/{y}/{z}/{crossZoom}?script={script}
```

`x, y, z` - Coordinates of loading tile.
`mode` - Name of site with online map viewer. Can be: overpass, waze, yandex, nakarte.
`crossZoom` - The zoom level below which the standard OpenStreetMap map will be displayed.
`script` - Clarifying information used in the URL. Can't be empty.

Example:
```
https://anygis.herokuapp.com/mapshoter/waze/9900/5133/14/10?script=noscript
```



### OverpassTurbo converter to PNG tiles

This script can be used for watching OverpassTurbo map from your navigator app. To do this your script shall look like this example. Especially first string with `bbox`.

```
[bbox:{{bbox}}];
(
  //your code here
  way[highway];
);
out body;>;out skel qt;
```

When your script finished you need get link to it. For example, there is link to one of my old Overpass scripts:
```
http://overpass-turbo.eu/s/KEy
```

Next I just copied `ID` of my script (s/KEy) to the `script` paramater of this URL. And now I can get PNG tiles from this URL.
```
https://anygis.herokuapp.com/mapshoter/overpass/{x}/{y}/{z}/15?script=s/KEy
```
