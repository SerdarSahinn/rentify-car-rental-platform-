import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  rating, 
  totalReviews = 0, 
  size = 'md',
  showCount = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Rating'i 0-5 arasında sınırla
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center space-x-2">
      {/* Yıldızlar */}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= clampedRating;
          const isPartial = star === Math.ceil(clampedRating) && clampedRating % 1 !== 0;
          
          return (
            <Star
              key={star}
              className={`${sizeClasses[size]} ${
                isFilled 
                  ? 'text-yellow-400 fill-current' 
                  : isPartial 
                    ? 'text-yellow-400 fill-current opacity-60'
                    : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>

      {/* Rating ve yorum sayısı */}
      {showCount && (
        <div className={`${textSizeClasses[size]} text-gray-600`}>
          <span className="font-medium">{clampedRating.toFixed(1)}</span>
          {totalReviews > 0 && (
            <span className="ml-1">({totalReviews} yorum)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;

