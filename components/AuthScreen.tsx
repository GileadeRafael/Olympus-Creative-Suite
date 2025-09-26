
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLoginView) {
        // FIX: The method `signInWithPassword` might not exist depending on the `@supabase/supabase-js` version.
        // `signIn` is a more compatible method for email/password authentication.
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Optional: show a "check your email" message
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-dark-gradient font-sans text-ocs-text">
      <div className="w-full max-w-md p-8 space-y-8 bg-ocs-darker rounded-2xl shadow-2xl">
        <div className="text-center">
            <img
                src='https://i.imgur.com/H7jW55P.png'
                alt="Olympus Creative Suite Logo"
                className="h-16 w-16 mx-auto mb-4"
            />
          <h2 className="text-3xl font-bold text-white">
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-ocs-text-dim">
            {isLoginView ? "Sign in to access your creative suite." : "Get started with your Olympus suite."}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-ocs-light bg-ocs-dark placeholder-ocs-text-dim text-white rounded-t-md focus:outline-none focus:ring-ocs-blue focus:border-ocs-blue focus:z-10 sm:text-sm`}
                placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-ocs-light bg-ocs-dark placeholder-ocs-text-dim text-white rounded-b-md focus:outline-none focus:ring-ocs-blue focus:border-ocs-blue focus:z-10 sm:text-sm"
                placeholder="Password" />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            {isLoginView && (
                <a href="#" className="font-medium text-ocs-blue hover:text-blue-400">
                    Forgot your password?
                </a>
            )}
          </div>

          <div>
            <button type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ocs-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ocs-darker focus:ring-ocs-blue transition-colors disabled:bg-ocs-light disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>
        
        <div className="text-center">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-sm font-medium text-ocs-text-dim hover:text-white">
                {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
      </div>
    </div>
  );
};
