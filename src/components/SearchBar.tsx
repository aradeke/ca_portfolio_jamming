import React, { useState } from 'react';
//mport type { Result } from '../App';

interface SearchBarProps {
    onSearch?: (searchTerm: string, offsetChange: string) => void, 
 
}

const SearchBar:React.FC<SearchBarProps> = ({onSearch}) => {

    const [inputTrack, setInputTrack] = useState<string>("");
       
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!onSearch) return;
        if(inputTrack.trim()) {
            onSearch(inputTrack.trim().toLowerCase(), "none" );
        }
        
    }

    return (
        <div id="search-bar">
            <h2>Search Bar</h2>
            <form id="searchForm" onSubmit={handleSubmit}>
                <button disabled type="button" id="dummyButton"></button>  
                <input 
                    id="trackSearchInput" 
                    type="text" 
                    placeholder={"Track suchen"} 
                    value={inputTrack}
                    onChange = {(e) => setInputTrack(e.target.value)}
                />
                <button type="submit">&#128269;</button>
            </form>
        </div>
    )


}


export default SearchBar;