import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { MessageCircle, Send, Trash2, Reply as ReplyIcon, X, User, Clock } from 'lucide-react';
import { createReply, deleteReply } from '../services/reviewApi';
import type { Reply, CreateReplyData } from '../services/reviewApi';

interface ReplyComponentProps {
  reviewId: string;
  replies: Reply[];
  onReplyAdded: () => void;
  isAdmin?: boolean;
}

const ReplyComponent: React.FC<ReplyComponentProps> = ({ 
  reviewId, 
  replies, 
  onReplyAdded, 
  isAdmin = false 
}) => {
  const { user, isSignedIn } = useUser();
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Yanıt ekle
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      setError('Yanıt eklemek için giriş yapmalısınız');
      return;
    }

    if (!newReply.trim()) {
      setError('Lütfen bir yanıt yazın');
      return;
    }

    // Duplicate submit'i önle
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const replyData: CreateReplyData = {
        reviewId,
        content: newReply.trim(),
        parentReplyId: replyingTo || undefined
      };

      console.log('📤 Yanıt gönderiliyor:', replyData);

      await createReply(replyData);

      console.log('✅ Yanıt başarıyla eklendi');

      // Formu temizle ve kapat
      setNewReply('');
      setReplyingTo(null);
      setShowReplyForm(false);
      
      // Parent component'i güncelle (sadece bir kez)
      setTimeout(() => {
        onReplyAdded();
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Yanıt ekleme hatası:', error);
      setError(error.message || 'Yanıt eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yanıt sil (admin için)
  const handleDeleteReply = async (replyId: string) => {
    if (!isAdmin) return;

    if (!confirm('Bu yanıtı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteReply(replyId);
      onReplyAdded();
    } catch (error: any) {
      setError(error.message || 'Yanıt silinemedi');
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Yanıt render et (recursive)
  const renderReply = (reply: Reply, level: number = 0) => {
    const maxLevel = 3;
    
    return (
      <div 
        key={reply.id} 
        className={`${level > 0 ? 'ml-6' : ''}`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className={`
          bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100
          hover:shadow-md transition-all duration-200
          ${level > 0 ? 'border-l-4 border-l-blue-200' : ''}
        `}>
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {reply.user.firstName?.[0] || reply.user.lastName?.[0] || 'U'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {reply.user.firstName && reply.user.lastName
                      ? `${reply.user.firstName} ${reply.user.lastName}`
                      : 'Anonim Kullanıcı'
                    }
                  </h4>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{formatDate(reply.createdAt)}</span>
                  </div>
                </div>
                
                {/* Admin Actions */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Yanıtı Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Reply Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {reply.content}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {isSignedIn && level < maxLevel && (
                  <button
                    onClick={() => {
                      setReplyingTo(reply.id);
                      setShowReplyForm(true);
                    }}
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors hover:bg-blue-50 px-3 py-1 rounded-full"
                  >
                    <ReplyIcon className="h-4 w-4" />
                    <span>Yanıtla</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nested Replies */}
        {reply.replies && reply.replies.length > 0 && level < maxLevel && (
          <div className="space-y-2">
            {reply.replies.map(nestedReply => renderReply(nestedReply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6">
      {/* Reply Button & Form */}
      {isSignedIn && (
        <div className="mb-6">
          {!showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
            >
              <ReplyIcon className="h-4 w-4" />
              <span>Bu yoruma yanıt yaz</span>
            </button>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
              {/* Form Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <ReplyIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {replyingTo ? 'Yanıt Yazıyorsunuz' : 'Yanıt Ekle'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {replyingTo ? 'Bir yanıta yanıt veriyorsunuz' : 'Bu yoruma yanıt yazın'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setNewReply('');
                    setReplyingTo(null);
                    setError('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Reply to indicator */}
              {replyingTo && (
                <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ReplyIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Yanıtlanıyor
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
              
              {/* Reply Form */}
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div>
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-400"
                    placeholder={replyingTo ? "Yanıtınızı yazın..." : "Bu yoruma yanıt yazın..."}
                    required
                  />
                </div>

                {/* Hata Mesajı */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Gönderiliyor...' : 'Yanıtı Gönder'}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false);
                        setNewReply('');
                        setReplyingTo(null);
                        setError('');
                      }}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors hover:bg-gray-100 rounded-lg"
                    >
                      İptal
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {newReply.length}/500 karakter
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Giriş Yapmamış Kullanıcılar İçin */}
      {!isSignedIn && (
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <User className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600 font-medium">Giriş Yapın</span>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Yanıt yapmak için lütfen giriş yapın
          </p>
          <a 
            href="/sign-in" 
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
          >
            <span>Giriş Yap</span>
          </a>
        </div>
      )}

      {/* Yanıtlar Listesi */}
      {replies.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Yanıtlar
              </h3>
              <p className="text-sm text-gray-600">
                {replies.length} yanıt bulundu
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {replies.map(reply => renderReply(reply))}
          </div>
        </div>
      )}

      {/* Yanıt Yoksa */}
      {replies.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz yanıt bulunmuyor
          </h3>
          <p className="text-gray-600 text-sm">
            İlk yanıtı siz yapın ve tartışmayı başlatın!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReplyComponent;
