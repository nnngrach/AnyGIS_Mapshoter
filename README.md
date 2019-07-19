# AnyGIS Mapshoter

Load vector online-map. Take screenshot. Return PNG tile.


### API

```
https://anygis.herokuapp.com/mapshoter/{mode}/{x}/{y}/{z}/{crossZoom}?script={script}
```

`x, y, z` - Coordinates of loading tile.

`mode` - Name of site with online map viewer. Can be: overpass, waze, yandex, nakarte.

`crossZoom` - The zoom level below which the standard OpenStreetMap map will be
 displayed.

`script` - Clarifying information used in the URL. Can't be empty.


Here is example of filler URL:
```
https://anygis.herokuapp.com/mapshoter/waze/9900/5133/14/10?script=noscript
```
[Viewer of converted tiles][0]


### OverpassTurbo converter to PNG tiles

This script can be used for watching OverpassTurbo map from navigator app of your smartphone. To do this your script must be look like this example. Especially for it's first string with `bbox`.

```
[bbox:{{bbox}}];
(

    // your code here:
    way[highway][surface=fine_gravel];

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
[Viewer of converted tiles][2]

Important: Turn off checkbox "include current map state"

![](https://raw.githubusercontent.com/nnngrach/AnyGIS_Mapshoter/master/views/img/overpass_sharing.png)







[0]: https://nakarte.me/#m=14/55.75282/37.62388&l=-cseyJuYW1lIjoiTWFwc2hvdGVyIFdhemUiLCJ1cmwiOiJodHRwczovL2FueWdpcy5oZXJva3VhcHAuY29tL21hcHNob3Rlci93YXplL3t4fS97eX0ve3p9LzEwP3NjcmlwdD1PIiwidG1zIjpmYWxzZSwic2NhbGVEZXBlbmRlbnQiOmZhbHNlLCJtYXhab29tIjoxOCwiaXNPdmVybGF5IjpmYWxzZSwiaXNUb3AiOnRydWV9

[1]: https://nakarte.me/#m=12/43.19997/42.82851&l=O/Wp

[2]: https://nakarte.me/#m=16/55.63412/37.55953&l=-cseyJuYW1lIjoiTWFwc2hvdGVyIEFueWdpcyBPdmVycGFzcyIsInVybCI6Imh0dHBzOi8vYW55Z2lzLmhlcm9rdWFwcC5jb20vbWFwc2hvdGVyL292ZXJwYXNzL3t4fS97eX0ve3p9LzE1P3NjcmlwdD1zL0tFeSIsInRtcyI6ZmFsc2UsInNjYWxlRGVwZW5kZW50IjpmYWxzZSwibWF4Wm9vbSI6MTgsImlzT3ZlcmxheSI6ZmFsc2UsImlzVG9wIjp0cnVlfQ==
