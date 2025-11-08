import React, { useState, useEffect } from 'react';
import PlayList from './components/PlayList';
import TrackList from './components/TrackList';
import SearchBar from './components/SearchBar';
//import {testTracks, testPlayList } from './components/TestComponents';
import {getToken, redirectToSpotifyAuth, getValidToken} from './utils/spotify';
import './styles/globals.css';

export type Result = { songName: string; artist: string; album: string; trackId: string };
export type PlayList = { playListName: string; tracks: Result[]; }

const spotifyBaseUrl = "https://api.spotify.com";

const App: React.FC = () => {

  
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  

  const login = async () => {
    redirectToSpotifyAuth(); // the URL you built with clientId, code_challenge, etc.
  };

  useEffect(() => {
    // Check if there is a Session saved and load it on loading screen
    const savedPlaylist = sessionStorage.getItem("customPlaylist");
    if (savedPlaylist) {
      setCustomPlayList(JSON.parse(savedPlaylist));
    
    }
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        const tokenData = await getToken(code);
        if (tokenData) {
          setAccessToken(tokenData.access_token);

          const expiresAt = Date.now() + tokenData.expires_in * 1000; // Spotify gives expires_in in seconds
          localStorage.setItem("expires_at", expiresAt.toString());

          console.log("Access token fetched. It expires at:", new Date(expiresAt).toLocaleString());
          // clean up URL (remove ?code=... etc.)
          window.history.replaceState({}, document.title, "/"); }
        return;  
      }
      
      const token = await getValidToken(accessToken);
      if (token) {
        setAccessToken(token);
        console.log("Loaded valid token from storage or refreshed token.");
      }

  };

  initAuth();
}, []);
          
     
          


  const handleSearch = async (term: string, offsetChange: string) => {
    const token = await getValidToken(accessToken);
    if (!token) return; // user redirected or refresh failed

    const searchEndpoint = "/v1/search";
    const queryParam = "&q="
    //const typeParam = "&type=album,track,artist";
    const typeParam = "&type=track";
    const limitParam = "&limit=10";
    const marketParam = "&market=DE";


    console.log('handleSearch called with:', term, offsetChange);
    if (term !== searchTerm) { setSearchTerm(term); }

    let newOffset = offset;
    switch(offsetChange) {
      case "back": newOffset = Math.max(offset -10, 0); break;
      case "forth": newOffset = offset + 10; break;
    }
    setOffset(newOffset);
    const offsetParam = `&offset=${newOffset}`;

    console.log(`Searching for "${term}" with offsetParam: ${offsetParam}`);

    const searchUrl = `${spotifyBaseUrl}${searchEndpoint}?${queryParam}${encodeURIComponent(term)}${typeParam}${limitParam}${marketParam}${offsetParam}`;
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        "Content-Type": 'application/json',
        "Authorization": `Bearer ${token}` 
      }
    });

    const data = await response.json();
    if(!data) { console.error('No data returned from Spotify API'); return; }
   
    const newResults: Result[] = data.tracks.items.map((item: any) => ({
      songName: item.name,
      artist: item.artists.map((a: any) => a.name).join(", "),
      album: item.album.name,
      trackId: item.id,
    }));

    setResults(newResults);
        
    console.log('Search results updated:', newResults);

  }


  const [customPlayList, setCustomPlayList] = useState<PlayList>({ playListName: '', tracks: [] });
  // Check if customPlayList changes and save it to session storage:
  useEffect(() => {
    sessionStorage.setItem("customPlaylist", JSON.stringify(customPlayList));
  }, [customPlayList]);

  const addToPlayList = (trackId: string ) => {
    //console.log(`Adding track with ID ${trackId} to playlist.`);
    // Implementation for adding track to playlist goes here

    if(!customPlayList.tracks.find(track => track.trackId === trackId)) 
    {
       const trackToAdd = results.find(track => track.trackId === trackId);
       if(trackToAdd) {
          //console.log('Track to add:', trackToAdd);
          setCustomPlayList(prevPlayList => ({
            ...prevPlayList,
            tracks: [...prevPlayList.tracks, trackToAdd]
          }));
        const addButton = document.getElementById("addButton-"+trackId)
        const checkButton = document.getElementById("trackListCheck-"+trackId)
        //console.log(addButton, checkButton);
        if(addButton) { addButton.style.display ="none";}
        if(checkButton) {checkButton.style.display = "inline";}

      } //else {console.log('Track not found in results.');}
    } //else {console.log('Track already in playlist.');}
  }

  const removeFromPlayList = (trackId: string ) => {
    //console.log(`Adding track with ID ${trackId} to playlist.`);
    // Implementation for adding track to playlist goes here
    if(customPlayList.tracks.find(track => track.trackId === trackId)) 
    {
      const trackToAdd = results.find(track => track.trackId === trackId);
      if(trackToAdd) {
        //console.log('Track to remove:', trackToAdd);
 
        const addButton = document.getElementById("addButton-"+trackId)
        const checkButton = document.getElementById("trackListCheck-"+trackId)
        if(addButton) {addButton.style.display = "inline";}
        if(checkButton) {checkButton.style.display = "none";}
      } 
      const updatedList: Result[] = customPlayList.tracks.filter(track => track.trackId !== trackId);
        setCustomPlayList(prevPlayList => ({
          ...prevPlayList,
          tracks: updatedList
      }));
    } 
  }
  //console.log('Custom Playlist:', customPlayList);

  /*
  useEffect(() => {
        console.log('Playlist name changed to (useEffect):', customPlayList.playListName);
  }, [customPlayList.playListName]);
  */

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Todo: Maybe check here if the name already exists and load the playlist
      // Then: Check if user should be able to overwrite the old one (check box beside sending button?)
      const newName = event.target.value;

      setCustomPlayList(prevPlayListName => ({
        ...prevPlayListName,
        playListName: newName
      }));      
  }

  const sendListToSpotify = async (playlist: PlayList) => {
    console.log('Sending playlist to Spotify:', playlist);
    
    // Avoid sending empty play lists
    if(playlist.tracks.length === 0) { 
      alert("Playlist is empty! Please add tracks before sending to Spotify."); 
      console.error("Playlist empty. Abort.")
      return; 
    }
  
    // Check for token:
    const token = await getValidToken(accessToken);
    if (!token) { console.error("No valid token available. User may need to log in.");return;} // user redirected or refresh failed



    
    // Check if name of playlist already given to another one 
    const endpoint = "/v1/me/playlists"; // Is used to check name and create playlist
    const existingPlayListsURL = `${spotifyBaseUrl}${endpoint}?limit=50`;
    const currentPlayListName: string  = playlist.playListName || "New Playlist";
    console.log("Current Play List Name:"+currentPlayListName);
       
    try {
      console.log("Trying to send "+existingPlayListsURL);
      const nameCheckResponse = await fetch(existingPlayListsURL, {
        method: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "Authorization": `Bearer ${token}`
        }
      });

      if (!nameCheckResponse.ok) {
        const text = await nameCheckResponse.text();
        throw new Error(`Spotify response error: ${nameCheckResponse.status} — ${text}`);
      }


      const existingData  = await nameCheckResponse.json();
      console.log("Existing playlists response:", existingData);
      
      if(existingData.items.find(({name}: { name: string}) => name === currentPlayListName)) {
        // Todo: Check if I want to update existing list instead
        // In this case, I could pass the play list creation here instead, if the name doesn't exist
        // Pro: User can modify his playlist in several steps
        // Contra: User won't be able to accidentaly alter existing list
        // Todo 2: Check to create logic to let user decide. 
        // Idea: Checkbox "Modyfiy existing playlist"
        alert("There is already a list with this name. Please chose another and try again.");
        console.error("playListName already does exist in user's account.");
        return;
      }

      const createPlayListResponse = await fetch(`${spotifyBaseUrl}${endpoint}`, {
        "method": "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
          name: currentPlayListName,
          description: "Created with Jamming: Add a description", // Todo: Maybe add this to the Playlist card
          public: false
        })
      });

      if(!createPlayListResponse.ok) { console.error("Error creating PlayList: No response from Spotify"); return;}

      const newSpotifyPlayList = await createPlayListResponse.json();
      const spotifyPlayListId: string = newSpotifyPlayList.id;
      console.log("Created playlist with ID: "+spotifyPlayListId);

      const trackIdList: string[] = playlist.tracks.map((track) => `spotify:track:${track.trackId}`);

      if(trackIdList.length === 0 ) {console.error("No IDs found.");return;}

      const addTracksURL  = `${spotifyBaseUrl}/v1/playlists/${spotifyPlayListId}/tracks`;
      const addTracksResponse = await fetch(addTracksURL, {
        "method": "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ uris: trackIdList, position: 0 })
      });
      if(!addTracksResponse.ok) {
        console.error("Play list not exported: No response from Spotify.");
        return;
      }
      //console.log(`Added ${addTracksResponse.uris.length} tracks to playlist "${currentPlayListName}"`);
       
    }
    catch(error: any) { console.error(`Playlist cannot be created: ${error.message}`); }
  }


  return (
    <>
    <header><h1>Jammming</h1></header>
    <main>
      {!accessToken ? 
        <button id="spotifyLogin" onClick={login}>Log in with Spotify</button> :
      <>
      <div id="searchCard" className="card">
        <SearchBar onSearch={handleSearch} />
        <TrackList results={results} onAdd={addToPlayList}  />
        <span id="pagination">
        <button 
          id="resultsBackButton" 
          type="button" onClick={() => handleSearch(searchTerm, "back")}
          disabled={offset === 0} >
          &#10510;</button>
        <button id="resultsForthButton" type="button" onClick={() => handleSearch(searchTerm, "forth")}>
          &#10511;</button></span>
       </div>
      <div id="playListCard" className="card">
        <PlayList 
          playList={customPlayList} 
          onRemove={removeFromPlayList} 
          onChange={handleNameChange}
          onSendToSpotify={sendListToSpotify} />
        </div>
      </>
    }
    </main>
    </>
  );
};


export default App;