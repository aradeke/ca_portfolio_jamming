import React from 'react';
import Track from './Track';



interface TrackItem {
  songName: string;
  artist: string;
  album: string;
  trackId: string;
}

interface TrackListProps {
  results: TrackItem[];
  onAdd?: (trackId: string) => void;
}

const TrackList: React.FC<TrackListProps> = ({results, onAdd}) => {

    return (
        <div id="tracklist">
            <h2>Search Results</h2>
            <ul id="results-list">
            {results.map(track => (
                <li key={track.trackId}>
                    <Track trackId={track.trackId} songName={track.songName} artist={track.artist} album={track.album}    />
                    <button 
                        id={"addButton-"+track.trackId} 
                        type="button" onClick={() => onAdd?.(track.trackId)}
                        style={{display:"inline"}}>+</button>
                    <button id={"trackListCheck-"+track.trackId} type="button" 
                        style={{display:"none"}}>✓</button>
                </li>
            ))}
            </ul>
        </div>
    );

}

export default TrackList;
