import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Star, MessageCircle, Send, Trash2 } from 'lucide-react';
import { createReview, getVehicleReviews, deleteReview, getRepliesForReview } from '../services/reviewApi';
import type { Review } from '../services/reviewApi';
import RatingDisplay from './RatingDisplay';
import ReplyComponent from './ReplyComponent';


interface ReviewComponentProps {
  vehicleId: string;
  isAdmin?: boolean;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({ vehicleId, isAdmin = false }) => {
  const { user, isSignedIn } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Yorumları yükle
  useEffect(() => {
    loadReviews();
  }, [vehicleId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Yorumlar yeniden yükleniyor...');
      
      const fetchedReviews = await getVehicleReviews(vehicleId);
      console.log('📥 Yüklenen yorumlar:', fetchedReviews);
      
      // Her review için replies'ları da yükle
      const reviewsWithReplies = await Promise.all(
        fetchedReviews.map(async (review) => {
          try {
            const replies = await getRepliesForReview(review.id);
            console.log(`📥 Review ${review.id} için yanıtlar:`, replies);
            return {
              ...review,
              replies: replies || []
            };
          } catch (error) {
            console.error(`❌ Review ${review.id} için yanıtlar yüklenemedi:`, error);
            return {
              ...review,
              replies: []
            };
          }
        })
      );
      
      console.log('✅ Tüm yorumlar ve yanıtlar yüklendi:', reviewsWithReplies);
      setReviews(reviewsWithReplies);
      
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error);
      setError('Yorumlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni yorum ekle
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      setError('Yorum eklemek için giriş yapmalısınız');
      return;
    }

    if (!newComment.trim()) {
      setError('Lütfen bir yorum yazın');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const newReview = await createReview({
        vehicleId,
        rating: selectedRating,
        comment: newComment.trim()
      });

      // Yeni yorumu listeye ekle
      setReviews(prev => [newReview, ...prev]);
      
      // Formu temizle
      setNewComment('');
      setSelectedRating(5);
      
      // Yorumları yeniden yükle (rating güncellemesi için)
      await loadReviews();
    } catch (error: any) {
      setError(error.message || 'Yorum eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yorum sil (admin için)
  const handleDeleteReview = async (reviewId: string) => {
    if (!isAdmin) return;

    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      await loadReviews(); // Rating güncellemesi için
    } catch (error: any) {
      setError(error.message || 'Yorum silinemedi');
    }
  };

  // Rating yıldızları render et
  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'button'}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <MessageCircle className="h-6 w-6 mr-3 text-blue-500" />
        Müşteri Yorumları
      </h3>

      {/* Yeni Yorum Formu */}
      {isSignedIn && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Yorum Yap</h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(selectedRating, true, setSelectedRating)}
                <span className="ml-2 text-sm text-gray-600">
                  {selectedRating} / 5
                </span>
              </div>
            </div>

            {/* Yorum Metni */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Bu araç hakkında deneyimlerinizi paylaşın..."
                required
              />
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Gönder Butonu */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Giriş Yapmamış Kullanıcılar İçin */}
      {!isSignedIn && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800">
            Yorum yapmak için lütfen{' '}
            <a href="/sign-in" className="font-medium underline hover:no-underline">
              giriş yapın
            </a>
          </p>
        </div>
      )}

      {/* Yorumlar Listesi */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Tüm Yorumlar ({reviews.length})
        </h4>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Yorumlar yükleniyor...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Henüz yorum bulunmuyor.</p>
            <p className="text-sm text-gray-400 mt-1">İlk yorumu siz yapın!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Kullanıcı Bilgisi */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {review.user.firstName?.[0] || review.user.lastName?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.user.firstName && review.user.lastName
                            ? `${review.user.firstName} ${review.user.lastName}`
                            : 'Anonim Kullanıcı'
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>

                    {/* Yorum Metni */}
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Reply Component */}
                    <ReplyComponent
                      reviewId={review.id}
                      replies={review.replies || []}
                      onReplyAdded={loadReviews}
                      isAdmin={isAdmin}
                    />
                  </div>

                  {/* Admin Silme Butonu */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Yorumu Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewComponent;
