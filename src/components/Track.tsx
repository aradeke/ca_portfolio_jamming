import React from 'react';
//import { testTracks } from './TestComponents';

export interface TrackProps {
    trackId: string;
    songName: string;
    artist: string;
    album: string;
}

const Track: React.FC<TrackProps> = ({ trackId, songName, artist, album }) => {

    return (
           
        <span id={trackId.toString()} className="track">
            <strong>{songName}</strong> by {artist} from {album}
        </span>
    );

}

export default Track;