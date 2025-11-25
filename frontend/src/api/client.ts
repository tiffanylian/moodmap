import { supabase } from "../lib/supabase";
import type { CurrentUser, MoodPin, Mood, fromDbMood, toDbMood } from "../types";
import { fromDbMood as convertFromDbMood, toDbMood as convertToDbMood } from "../types";

/**
 * Get the current authenticated user and check if they've submitted a pin today
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Get the current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    return null;
  }

  const userId = session.user.id;
  const email = session.user.email || "";

  // Check if user has submitted a pin today
  const today = new Date().toISOString().split('T')[0];
  const { count, error: countError } = await supabase
    .from('mood_pins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`);

  const hasSubmittedPin = !countError && (count ?? 0) > 0;

  return {
    id: userId,
    email,
    hasSubmittedPin,
  };
}

/**
 * Sign in with email using Supabase magic link
 * This will send an email to the user with a login link
 */
export async function loginWithEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // After this, user needs to check their email and click the link
  // You may want to show a message to the user
}

/**
 * Sign out the current user
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetch all mood pins from the database
 */
export async function fetchPins(): Promise<MoodPin[]> {
  const { data, error } = await supabase
    .from('mood_pins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Convert database format to frontend format
  return data.map(pin => ({
    id: pin.id,
    lat: pin.latitude,
    lng: pin.longitude,
    mood: convertFromDbMood(pin.mood),
    message: pin.note || undefined,
    createdAt: pin.created_at,
  }));
}

/**
 * Create a new mood pin
 * Rate limited to 5 pins per user per day by RLS policy
 */
export async function createPin(input: {
  lat: number;
  lng: number;
  mood: Mood;
  message?: string;
}): Promise<MoodPin> {
  // Get current user
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    throw new Error('You must be logged in to create a pin');
  }

  // Ensure user exists in the users table
  await ensureUserExists(session.user.id, session.user.email || '');

  // Insert the pin
  const { data, error } = await supabase
    .from('mood_pins')
    .insert({
      user_id: session.user.id,
      mood: convertToDbMood(input.mood),
      note: input.message || null,
      latitude: input.lat,
      longitude: input.lng,
    })
    .select()
    .single();

  if (error) {
    // Check if it's a rate limit error
    if (error.message.includes('5 pins per user per day')) {
      throw new Error('You have reached the daily limit of 5 pins');
    }
    throw new Error(error.message);
  }

  return {
    id: data.id,
    lat: data.latitude,
    lng: data.longitude,
    mood: convertFromDbMood(data.mood),
    message: data.note || undefined,
    createdAt: data.created_at,
  };
}

/**
 * Helper function to ensure user exists in the users table
 * Called before creating a pin
 */
async function ensureUserExists(userId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, email }, { onConflict: 'id' });

  if (error && !error.message.includes('duplicate')) {
    throw new Error(error.message);
  }
}
