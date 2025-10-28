import React from 'react';

interface PortfolioCardProps {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ title, description, imageUrl, link }) => {
    return (
        <div className="portfolio-card">
            <img src={imageUrl} alt={title} className="portfolio-image" />
            <h3 className="portfolio-title">{title}</h3>
            <p className="portfolio-description">{description}</p>
            <a href={link} className="portfolio-link">View Project</a>
        </div>
    );
};

export default PortfolioCard;