'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Key, Copy, RefreshCw, AlertTriangle, CheckCircle2,
  Lock, Clock, Eye, EyeOff, Zap, ChevronRight, X
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

// ─── Types ─────────────────────────────────────────────────────────────────
interface TokenStatus {
  plan: string;
  project_status: string | null;
  can_create: boolean;
  has_token: boolean;
  token: {
    prefix: string;
    created_at: string;
    last_used_at: string | null;
  } | null;
}

// ─── Helper ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MaskedToken({ prefix }: { prefix: string }) {
  return (
    <span className="font-mono select-all">
      <span className="text-primary">{prefix}</span>
      {'••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
    </span>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────
function Modal({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl border bg-background shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ApiKeysPage() {
  const supabase = createClient();

  const [status, setStatus] = useState<TokenStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);

  // Newly generated tokens (state only — gone on refresh)
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch status
  const fetchStatus = useCallback(async (uid: string) => {
    const res = await fetch('/api/user/token/status', {
      headers: { 'x-user-id': uid },
    });
    const data = await res.json();
    setStatus(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        fetchStatus(data.user.id);
      }
    });
  }, [fetchStatus]);

  const handleCreate = async () => {
    if (!userId) return;
    setActionLoading(true);
    setActionError(null);
    const res = await fetch('/api/user/token/create', {
      method: 'POST',
      headers: { 'x-user-id': userId },
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) {
      setActionError(data.error || 'Failed to create token.');
      return;
    }
    setNewToken(data.token);
    setShowCreateModal(false);
    fetchStatus(userId);
  };

  const handleRegenerate = async () => {
    if (!userId) return;
    setActionLoading(true);
    setActionError(null);
    const res = await fetch('/api/user/token/regenerate', {
      method: 'POST',
      headers: { 'x-user-id': userId },
    });
    const data = await res.json();
    setActionLoading(false);
    setShowRegenModal(false);
    if (!res.ok) {
      setActionError(data.error || 'Failed to regenerate.');
      return;
    }
    setNewToken(data.token);
    fetchStatus(userId);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const s = status!;
  const noProject = !s.project_status;
  const projectPending = s.project_status === 'pending';

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Key className="h-7 w-7" /> API Keys
        </h1>
        <p className="text-muted-foreground mt-1">Manage your Bearer access tokens for the BorsaAPI.</p>
      </div>

      {/* ── State 1: No project (locked) ── */}
      <AnimatePresence mode="wait">
        {!s.can_create && noProject && (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="py-10 flex flex-col items-center text-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">API Key Locked</h2>
                  <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                    To get an API key on the Free plan, you must first submit your project for review.
                    Supporter plan users can skip this step.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Button asChild>
                    <Link href="/dashboard/projects">
                      Submit Your Project <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/#pricing">Upgrade Plan <Zap className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── State 2: Project pending ── */}
        {!s.can_create && projectPending && (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">
              <Clock className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-600 dark:text-yellow-400">Project Under Review</p>
                <p className="text-sm text-muted-foreground">
                  Your project has been submitted and is awaiting approval. You will be able to create an API key once it's approved.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Key card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Your API Key</CardTitle>
                <CardDescription>Use this as a Bearer token in the Authorization header.</CardDescription>
              </div>
              <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                s.plan === 'supporter'
                  ? 'bg-purple-500/20 text-purple-500'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {s.plan === 'supporter' ? '⚡ Supporter' : 'Free Plan'}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Token display */}
            <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-3 min-h-[56px]">
              {s.has_token ? (
                <>
                  <div className="flex-1 text-sm overflow-hidden">
                    <MaskedToken prefix={s.token!.prefix} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRevealModal(true)}
                    className="shrink-0"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-sm italic">No API key created yet.</p>
              )}
            </div>

            {/* Meta info */}
            {s.token && (
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1">Created</p>
                  <p className="font-medium text-foreground">{new Date(s.token.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1">Last Used</p>
                  <p className="font-medium text-foreground">{timeAgo(s.token.last_used_at)}</p>
                </div>
              </div>
            )}

            {/* Error */}
            {actionError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {actionError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => setShowCreateModal(true)}
                disabled={!s.can_create || s.has_token}
                className="gap-2"
                title={
                  !s.can_create
                    ? 'Submit your project first'
                    : s.has_token
                    ? 'You already have a key — regenerate instead'
                    : 'Create your API key'
                }
              >
                <Key className="h-4 w-4" />
                {s.has_token ? 'Key Active' : 'Create Key'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowRegenModal(true)}
                disabled={!s.has_token}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            </div>

            {/* Usage example */}
            {s.has_token && (
              <div className="rounded-xl bg-muted/50 border p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usage Example</p>
                <pre className="text-xs overflow-x-auto text-foreground"><code>{`curl https://borsaapi.vercel.app/api/v2/get-price?item=usd&location=erbil \\
  -H "Authorization: Bearer YOUR_TOKEN"`}</code></pre>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Newly revealed token (state only) ── */}
      <AnimatePresence>
        {newToken && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  Your New API Key
                </CardTitle>
                <CardDescription className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Copy this now. We do not store it. You cannot see it again after leaving this page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-background p-4">
                  <code className="flex-1 text-xs font-mono break-all select-all text-foreground">
                    {newToken}
                  </code>
                  <Button
                    size="sm"
                    variant={copied ? 'default' : 'outline'}
                    onClick={() => handleCopy(newToken)}
                    className="shrink-0"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewToken(null)}
                  className="text-muted-foreground"
                >
                  I have copied my key — dismiss
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}

      {/* Create confirm modal */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Create API Key</h2>
          </div>
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-600 dark:text-yellow-400">Your key will only be shown once.</p>
              <p className="text-muted-foreground mt-1">We do not store the raw key. If you lose it, you will need to regenerate a new one.</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Generate Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* Regenerate confirm modal */}
      <Modal show={showRegenModal} onClose={() => setShowRegenModal(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/10 p-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold">Regenerate API Key?</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Your current key will <span className="text-red-500 font-semibold">stop working immediately</span>. Every app or integration using it will break until you update them with the new key.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowRegenModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRegenerate} disabled={actionLoading}>
              {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Yes, Regenerate
            </Button>
          </div>
        </div>
      </Modal>

      {/* "Reveal" — explain it's gone */}
      <Modal show={showRevealModal} onClose={() => setShowRevealModal(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Key Cannot Be Revealed</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Your API key was shown <span className="font-medium text-foreground">one time only</span> when it was created. For security, we only store a hash — the raw key is gone.</p>
            <p>If you need to access your key again, you must <span className="font-medium text-foreground">regenerate a new one</span>. Your old key will stop working.</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowRevealModal(false)}>Close</Button>
            <Button variant="destructive" onClick={() => { setShowRevealModal(false); setShowRegenModal(true); }}>
              Regenerate Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
