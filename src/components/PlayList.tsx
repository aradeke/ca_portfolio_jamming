import React from 'react';
import Track from './Track';
import type { TrackProps } from './Track';


interface PlayListItem {
    playListName: string;
    tracks: TrackProps[];
   
}


type PlayListProps = { 
    playList: PlayListItem; 
    onRemove?: (trackId: string) => void;  
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSendToSpotify?: (playlist: PlayListItem) => void;
}

const PlayList: React.FC<PlayListProps> = ({playList, onRemove, onChange, onSendToSpotify}) => {

   //console.log('Rendering PlayList component with playList:', playList);
    
    return (
        <div id="playlist">
            <div id="headPlayList">
                <label htmlFor="playListName"><h2>Custom Playlist: {playList.playListName}</h2></label> 
                <input type="text" id="playListName" 
                    placeholder={ playList.playListName ? playList.playListName : "Name your Playlist" } 
                    onChange={(event) => onChange?.(event)} /> 
            </div>
            <ul id="custom-playlist">
                {playList.tracks.map(track => (
                <li key={track.trackId}>
                    <Track trackId={track.trackId} songName={track.songName} artist={track.artist} album={track.album}    />
                    <button type="button" onClick={() => onRemove?.(track.trackId)} >-</button>
                
                </li>
            ))}
            </ul>
            <form id="saveToSpotify">
                <button id="saveToSpotifyButton" type="button" onClick={() => onSendToSpotify?.(playList)} >Save to Spotify!</button>
            </form>
        </div>
    );

}

export default PlayList;


/*
Your Jammming web app should allow the user to customize their playlist title and tracks. 
When a user creates a playlist, your app should 
display the playlist name and tracks from the playlist.

Create a unidirectional data flow from your root component to relevant children components. 
This data flow should pass down the playlist name and tracks.

*/