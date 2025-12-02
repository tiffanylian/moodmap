import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import EmotionButton from '../components/EmotionButton';
import FloatingStars from '../components/FloatingStars';
import LoginScreen from '../components/LoginScreen';
import MapPinScreen from '../components/MapPinScreen';
import { Sparkles, Heart, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const emotions = [
  { emoji: '😰', label: 'stressed', color: '#A7C7E7' },
  { emoji: '😴', label: 'tired', color: '#B8B8B8' },
  { emoji: '😎', label: 'vibes', color: '#FFE17B' },
  { emoji: '🔥', label: 'hyped', color: '#FF9AA2' },
  { emoji: '😐', label: 'mid', color: '#B4E7CE' },
];

export default function MoodTracker() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [savedEmoji, setSavedEmoji] = useState(null);
  const queryClient = useQueryClient();

  const saveMoodMutation = useMutation({
    mutationFn: (data) => base44.entities.MoodEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['moods']);
      const emotionData = emotions.find(e => e.label === selectedEmotion);
      setSavedEmoji(emotionData?.emoji || '✨');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowMap(true);
      }, 1500);
      toast.success('mood logged! ✨');
    },
  });

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleMapComplete = (pin) => {
    setShowMap(false);
    setSelectedEmotion(null);
    setNotes('');
    setSavedEmoji(null);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (showMap) {
    return <MapPinScreen onComplete={handleMapComplete} moodEmoji={savedEmoji} />;
  }

  const handleSave = () => {
    if (!selectedEmotion) {
      toast.error('pick a vibe first!');
      return;
    }

    const emotionData = emotions.find(e => e.label === selectedEmotion);
    saveMoodMutation.mutate({
      emotion: selectedEmotion,
      emoji: emotionData.emoji,
      notes: notes,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <FloatingStars selectedMood={selectedEmotion} />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        <button
          onClick={() => setIsLoggedIn(false)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            how r u feeling today?
          </motion.h1>
          <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            check in with yourself bestie
            <Sparkles className="w-4 h-4" />
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Emotion card with tape effect */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-2xl border-2 border-white">
                {/* Tape decorations */}
                <div className="absolute -top-4 left-8 w-20 h-8 bg-amber-200/80 rotate-[-8deg] shadow-md rounded-sm" />
                <div className="absolute -bottom-4 right-8 w-20 h-8 bg-amber-200/80 rotate-[8deg] shadow-md rounded-sm" />
                
                <div className="flex flex-wrap justify-center gap-4">
                  {emotions.map((emotion) => (
                    <EmotionButton
                      key={emotion.label}
                      {...emotion}
                      isSelected={selectedEmotion === emotion.label}
                      onClick={() => setSelectedEmotion(emotion.label)}
                    />
                  ))}
                </div>
              </div>

              {/* Notes section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl p-6 shadow-lg mb-6"
              >
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  wanna spill? (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="like, what's on your mind rn..."
                  className="w-full min-h-[100px] bg-white/50 border-2 border-amber-300/50 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </motion.div>

              {/* Save button */}
              <Button
                onClick={handleSave}
                disabled={saveMoodMutation.isPending}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {saveMoodMutation.isPending ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ✨
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-2">
                    log this vibe
                    <Heart className="w-5 h-5 fill-current" />
                  </span>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5 }}
                className="text-8xl mb-4"
              >
                ✨
              </motion.div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                slay! logged ✓
              </h2>
              <p className="text-gray-600">your vibe has been captured</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
