'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  FolderOpen, Clock, CheckCircle2, XCircle, RefreshCw,
  ChevronRight, AlertTriangle, ExternalLink, Send, Pencil,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  how_using: string;
  logo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

type PageView = 'loading' | 'no-project' | 'form' | 'pending' | 'approved' | 'rejected';

interface FormState {
  name: string;
  url: string;
  description: string;
  how_using: string;
  logo_url: string;
}

interface FormErrors {
  name?: string;
  url?: string;
  description?: string;
  how_using?: string;
  global?: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  url: '',
  description: '',
  how_using: '',
  logo_url: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Project name is required.';
  if (!form.url.trim()) {
    errors.url = 'Project URL is required.';
  } else {
    try { new URL(form.url.startsWith('http') ? form.url : `https://${form.url}`); }
    catch { errors.url = 'Enter a valid URL (e.g. example.com).'; }
  }
  if (!form.description.trim()) errors.description = 'Description is required.';
  if (form.description.length > 300) errors.description = 'Max 300 characters.';
  if (!form.how_using.trim()) errors.how_using = 'This field is required.';
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function Spinner() {
  return <RefreshCw className="h-4 w-4 animate-spin" />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [view, setView] = useState<PageView>('loading');
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // true = PUT, false = POST

  // ── Fetch on mount ──────────────────────────────────────────────────────────

  const fetchProject = useCallback(async () => {
    setView('loading');
    const res = await fetch('/api/user/project');
    const data = await res.json();
    if (!data.project) {
      setProject(null);
      setView('no-project');
    } else {
      setProject(data.project);
      setView(data.project.status as PageView);
    }
  }, []);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  // ── Form helpers ────────────────────────────────────────────────────────────

  function openFormForCreate() {
    setForm(EMPTY_FORM);
    setErrors({});
    setIsEditing(false);
    setView('form');
  }

  function openFormForEdit(p: Project) {
    setForm({
      name: p.name,
      url: p.url,
      description: p.description,
      how_using: p.how_using,
      logo_url: p.logo_url ?? '',
    });
    setErrors({});
    setIsEditing(true);
    setView('form');
  }

  function setField(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});

    // Normalise URL
    const normalizedUrl = form.url.startsWith('http') ? form.url : `https://${form.url}`;
    const payload = { ...form, url: normalizedUrl };

    const res = await fetch('/api/user/project', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setErrors({ global: data.error ?? 'Something went wrong. Please try again.' });
      return;
    }

    setProject(data.project);
    setView('pending');
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FolderOpen className="h-7 w-7" /> Project Listing
        </h1>
        <p className="text-muted-foreground mt-1">
          Submit your project for review to unlock your free API key.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {view === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex justify-center py-20">
            <Spinner />
          </motion.div>
        )}

        {/* ── State 1: No project ─────────────────────────────────────────── */}
        {view === 'no-project' && (
          <motion.div key="no-project"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="py-14 flex flex-col items-center text-center gap-5">
                <div className="rounded-full bg-muted p-5">
                  <FolderOpen className="h-9 w-9 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">List Your Project</h2>
                  <p className="text-muted-foreground text-sm mt-2 max-w-sm">
                    You need to submit your project so we can verify legitimate API usage.
                    Once approved, your free API key will be unlocked.
                  </p>
                </div>
                <Button size="lg" onClick={openFormForCreate} className="gap-2">
                  Submit Your Project <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── State 2: Form ───────────────────────────────────────────────── */}
        {view === 'form' && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  {isEditing ? 'Edit Your Submission' : 'Submit Your Project'}
                </CardTitle>
                <CardDescription>
                  All fields marked * are required. Usually reviewed within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                  {/* Global error */}
                  {errors.global && (
                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {errors.global}
                    </div>
                  )}

                  {/* Project Name */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="proj-name"
                      placeholder="e.g. Borsa Live App"
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    <FieldError msg={errors.name} />
                  </div>

                  {/* Project URL */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Project URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="proj-url"
                      type="url"
                      placeholder="e.g. https://borsalive.com"
                      value={form.url}
                      onChange={e => setField('url', e.target.value)}
                      className={errors.url ? 'border-red-500' : ''}
                    />
                    <FieldError msg={errors.url} />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center justify-between">
                      <span>Description <span className="text-red-500">*</span></span>
                      <span className={`text-xs font-normal ${form.description.length > 280 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                        {form.description.length} / 300
                      </span>
                    </label>
                    <textarea
                      id="proj-description"
                      rows={3}
                      placeholder="Briefly describe what your project does."
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      maxLength={300}
                      className={`flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none transition-colors ${errors.description ? 'border-red-500' : 'border-input'}`}
                    />
                    <FieldError msg={errors.description} />
                  </div>

                  {/* How are you using */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      How are you using BorsaAPI? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="proj-how-using"
                      rows={3}
                      placeholder="e.g. Showing USD/IQD exchange rates in my mobile app for users in Iraqi Kurdistan."
                      value={form.how_using}
                      onChange={e => setField('how_using', e.target.value)}
                      className={`flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none transition-colors ${errors.how_using ? 'border-red-500' : 'border-input'}`}
                    />
                    <FieldError msg={errors.how_using} />
                  </div>

                  {/* Logo URL (optional) */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Logo URL <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Input
                      id="proj-logo"
                      placeholder="https://example.com/logo.png"
                      value={form.logo_url}
                      onChange={e => setField('logo_url', e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={submitting} className="gap-2">
                      {submitting ? <Spinner /> : <Send className="h-4 w-4" />}
                      {submitting
                        ? 'Submitting…'
                        : isEditing ? 'Resubmit Project' : 'Submit Project'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (project) setView(project.status as PageView);
                        else setView('no-project');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── State 3: Pending ────────────────────────────────────────────── */}
        {view === 'pending' && project && (
          <motion.div key="pending"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-500/15 p-3 shrink-0">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle>Under Review</CardTitle>
                    <CardDescription className="mt-0.5">
                      Usually reviewed within 24 hours.
                    </CardDescription>
                  </div>
                  <span className="ml-auto text-xs font-semibold bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                  <Row label="Project" value={project.name} />
                  <Row label="URL" value={
                    <a href={project.url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm">
                      {project.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  } />
                  <Row label="Submitted" value={formatDate(project.created_at)} />
                </div>

                <Button variant="outline" onClick={() => openFormForEdit(project)} className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit Submission
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── State 4: Approved ───────────────────────────────────────────── */}
        {view === 'approved' && project && (
          <motion.div key="approved"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-500/15 p-3 shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Project Approved</CardTitle>
                    <CardDescription className="mt-0.5">
                      Your API key is now unlocked.
                    </CardDescription>
                  </div>
                  <span className="ml-auto text-xs font-semibold bg-green-500/15 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
                    Approved
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                  <Row label="Project" value={project.name} />
                  <Row label="URL" value={
                    <a href={project.url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm">
                      {project.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  } />
                </div>

                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    🎉 Your project is approved! Head to API Keys to create your token and start building.
                  </p>
                </div>

                <Button asChild className="gap-2 bg-green-600 hover:bg-green-700">
                  <Link href="/dashboard/api-keys">
                    Go to API Keys <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── State 5: Rejected ───────────────────────────────────────────── */}
        {view === 'rejected' && project && (
          <motion.div key="rejected"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-500/15 p-3 shrink-0">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <CardTitle>Submission Rejected</CardTitle>
                    <CardDescription className="mt-0.5">
                      Fix the issue below and resubmit.
                    </CardDescription>
                  </div>
                  <span className="ml-auto text-xs font-semibold bg-red-500/15 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">
                    Rejected
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                  <Row label="Project" value={project.name} />
                  <Row label="URL" value={
                    <a href={project.url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm">
                      {project.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  } />
                </div>

                {project.rejection_reason && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-1">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-foreground mt-1">{project.rejection_reason}</p>
                  </div>
                )}

                <Button onClick={() => openFormForEdit(project)} className="gap-2 bg-red-600 hover:bg-red-700">
                  <Pencil className="h-4 w-4" /> Fix and Resubmit
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
