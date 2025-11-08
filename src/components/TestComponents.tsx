import type { Result, PlayList } from '../App';


const testTracks: Result[] = [
    { songName: 'Radio Gaga', artist: 'Queen', album: 'The Works', trackId: "0" },
    { songName: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', trackId: "1" },
    { songName: 'Like a Prayer', artist: 'Madonna', album: 'Like a Prayer', trackId: "2" },
  ];
export { testTracks};


const testPlayList: PlayList = { playListName: '', tracks: [testTracks[0], testTracks[1]]};
export { testPlayList };  


