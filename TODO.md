

# settings
1. fullscreen settings
2. playback speed settings ( DONE )
3. how many seconds to wait before turning off akara-control in fullscreen mode ( settings )
4. styling cues
5. automatically playing converted media ( SETTINGS )
6. play other media when conversion is taking place ( SETTINGS )
7. ask for where to save subtitle ( SETTINGS )
8. install superagent for api calls on youtube, fb, twiter and others, instead of using the built in http/https module
9. support for plugin on playlist ( get, set , remove , delete )
10. fix repeat bug once and for all
ffmpeg -i input.mp4 <video options> -filter split rtmp://server[:port][/app] out.mp4

ffmpeg -i original.mp4 -c:v libvpx -preset slow -s 1024x576 -qmin 0 -qmax 50 -an -b:v 400K -pass 1 homepage.webm
ffmpeg -i original.mp4 -c:v libx264 -preset slow -s 1024x576 -an -b:v 370K homepage.mp4
11. put function specific to a section to it's on section instead of util.js
12. fork m3u8-reader and use the forked repo as the default ( DONE )
ffmpeg -i Videos/gulps/part15/15-01-softbodies-part1-vertexweight-mobile.mp4 -c copy -f rtp_mpegts rtp://localhost:4000 -c copy -f flv - | ffmpeg -f flv -i - -c copy -f mp4 tt.mp4

13. go to each settings window pug file and make the similar list inerface modular
14. decrease or increase system sound
15. add grid and list settings for podcast episodes
16. get the dimension of an image , don't upload image more than a specific size
17. validate unicode values
18. unicode values as font
19. convert image uploaded to data-uri
20. settings for context menu icons
21. In subtitle settings add support for toggling on or off automatic subtitle adding if the name of the media file equals its su
btitle file
22. fix resuming media from previously stopped location
23. Add support for backspace key to unset a shortcut key ( DONE )
24. Handle crazy shortcut keys such as pageup and all of its siblings ( DONE )
25. automatically add downloaded subtitle from net to video
