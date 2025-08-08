import { useUser, useClerk } from '@clerk/clerk-react';

export const useAuth = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  const requireAuth = (callback?: () => void) => {
    console.log('🔍 requireAuth çağrıldı');
    console.log('🔍 isLoaded:', isLoaded);
    console.log('🔍 isSignedIn:', isSignedIn);
    
    if (!isLoaded) {
      console.log('🔍 Clerk henüz yüklenmedi');
      return;
    }
    
    if (!isSignedIn) {
      console.log('🔍 Kullanıcı giriş yapmamış, Clerk giriş ekranı açılıyor');
      openSignIn({
        afterSignInUrl: window.location.href,
      });
      return;
    }
    
    console.log('🔍 Kullanıcı giriş yapmış, callback çalıştırılıyor');
    if (callback) {
      callback();
    }
  };

  return {
    user,
    isSignedIn,
    isLoaded,
    requireAuth,
  };
}; 