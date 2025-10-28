import React from 'react';

const Header: React.FC = () => {
    return (
        <header>
            <h1>CA Portfolio Jamming</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/projects">Projects</a></li>
                    <li><a href="/about">About</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;