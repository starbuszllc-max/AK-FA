export function supabaseClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signOut: async () => {},
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ error: new Error('Supabase auth is disabled. Use onboarding instead.') }),
      signUp: async () => ({ data: null, error: new Error('Supabase auth is disabled. Use onboarding instead.') }),
    },
    from: () => ({
      select: () => ({ single: async () => ({ data: null, error: null }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    }),
  };
}

export function supabaseAdmin() {
  return supabaseClient();
}

export default supabaseClient;
