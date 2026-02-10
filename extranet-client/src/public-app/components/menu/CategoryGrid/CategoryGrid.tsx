import React from 'react';
import { Category } from '../../../types/menu.types';
import './CategoryGrid.css';

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
  const handleClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offsetPosition = element.offsetTop - 150;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Generate pattern that creates masonry effect with flat base
  const generatePattern = (totalCount: number): boolean[] => {
    const pattern: boolean[] = [];
    
    // Masonry pattern for balanced columns with flat base
    // Pattern varies based on count to ensure both columns end evenly
    
    if (totalCount === 1) {
      return [true]; // L
    }
    
    if (totalCount === 2) {
      return [true, false]; // L S
    }
    
    if (totalCount === 3) {
      return [true, false, false]; // L S S - flat base
    }
    
    if (totalCount === 4) {
      return [true, false, true, false]; // L S L S - flat base
    }
    
    if (totalCount === 5) {
      return [true, false, true, true, false]; // L S L L S - flat base
    }
    
    if (totalCount === 6) {
      return [true, false, true, true, false, false]; // L S L L S S - flat base
    }
    
    // For 7+ categories, use repeating pattern that maintains flat base
    // Pattern: L S L L S S (6 items = 8 rows total, 4 rows per column)
    const basePattern = [true, false, true, true, false, false];
    const patternLength = 6;
    const patternRows = 8; // Total rows this pattern creates
    
    const completePatterns = Math.floor(totalCount / patternLength);
    const remainder = totalCount % patternLength;
    
    // Add complete patterns
    for (let i = 0; i < completePatterns; i++) {
      pattern.push(...basePattern);
    }
    
    // Add remainder based on what creates flat base
    if (remainder === 1) {
      pattern.push(true); // L
    } else if (remainder === 2) {
      pattern.push(true, false); // L S
    } else if (remainder === 3) {
      pattern.push(true, false, false); // L S S
    } else if (remainder === 4) {
      pattern.push(true, false, true, false); // L S L S
    } else if (remainder === 5) {
      pattern.push(true, false, true, true, false); // L S L L S
    }
    
    return pattern;
  };

  const pattern = generatePattern(categories.length);

  return (
    <div className="public-category-grid-section">
      {/* <h2 className="public-category-grid-title">Categories</h2> */}
      <div className="public-category-grid">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={`public-category-grid-card ${pattern[index] ? 'large' : 'small'}`}
            onClick={() => handleClick(category.id)}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="public-category-grid-card-image"
              />
            ) : (
              <div className="public-category-grid-card-placeholder">
                <span className="public-category-grid-placeholder-icon">🍴</span>
              </div>
            )}
            <div className="public-category-grid-card-overlay">
              <h3 className="public-category-grid-card-name">{category.name}</h3>
              <p className="public-category-grid-card-count">{category.items.length} items</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
