"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2, AlertTriangle } from "lucide-react";
import { onboardBrand } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboardBrand = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { brandId } = await onboardBrand(url);
      router.push(`/brand/${brandId}`);
    } catch (error: any) {
      setError(error.message || "Failed to onboard brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] -z-10 animate-pulse" />

      <main className="max-w-5xl mx-auto px-6 py-24 w-full relative z-10">
        <div className="text-center mb-16 space-y-6 animate-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/20 shadow-sm backdrop-blur-sm mb-4">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-700">
              Next Gen Marketing
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-700 tracking-tight leading-[1.1] pb-2">
            Your AI Marketing <br />
            <span className="gradient-text">Department</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Turn your website into a Brand DNA. Generate hyper-personalized,{" "}
            <br className="hidden md:block" />
            on-brand campaigns in seconds.
          </p>
        </div>

        <div
          className="max-w-2xl mx-auto animate-in"
          style={{ animationDelay: "0.2s" }}
        >
          <form
            onSubmit={handleOnboardBrand}
            className="glass p-8 rounded-3xl space-y-4 relative"
          >
            <div className="absolute -top-6 -right-6 p-4 bg-white rounded-2xl shadow-lg border animate-bounce">
              <Wand2 className="w-6 h-6 text-indigo-600" />
            </div>

            <div className="relative group">
              <Input
                type="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="text-xl h-16 md:h-20 px-8 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all bg-white/50 shadow-inner"
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none group-focus-within:ring-2 ring-indigo-500/10 transition-all" />
            </div>

            <Button
              type="submit"
              disabled={loading || !url}
              className="w-full h-16 md:h-18 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold shadow-xl shadow-indigo-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Generate Brand DNA
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div
            className="mt-6 p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl backdrop-blur-sm animate-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 leading-relaxed">
                <p className="font-bold mb-1">⚠️ Hosted Demo Limitation</p>
                <p>
                  Website indexing may <strong>time out</strong> on this hosted
                  version due to serverless function limits. For the best
                  experience, please <strong>run the app locally</strong> or use
                  this pre-indexed dummy brand:
                </p>
                <p className="mt-2 font-mono text-xs bg-amber-100/60 px-3 py-1.5 rounded-lg inline-block select-all">
                  http://localhost:3000/campaign?brandId=9152c91c-8e54-4c0b-8f4c-21b34573b79e
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 text-center rounded-xl animate-in">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="mt-12 flex justify-center items-center gap-8 text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-slate-700">10x</span>
              <span className="text-xs uppercase tracking-widest font-bold">
                Faster
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-slate-700">100%</span>
              <span className="text-xs uppercase tracking-widest font-bold">
                On-Brand
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
