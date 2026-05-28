"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ApiDetailView } from "@/components/api-detail-view";
import { useAuth } from "@/components/providers/auth-provider";
import { getApi, deleteApi, removeStoredApiName } from "@/lib/api";
import { Api } from "@/lib/types";

export default function ApiDetail() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const apiName = params.apiName as string;

  const [api, setApi] = useState<Api | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchApi = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getApi(user.user_name, apiName);
      setApi(data);
    } finally {
      setLoading(false);
    }
  }, [user, apiName]);

  useEffect(() => {
    fetchApi();
  }, [fetchApi]);

  async function handleDelete() {
    if (!user || !api) return;
    if (!confirm(`delete "${api.name}"? this cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteApi(user.user_name, api.name);
      removeStoredApiName(user.user_name, api.name);
      router.push("/dashboard");
    } catch {
      setDeleting(false);
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto w-full space-y-4">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← back
        </Link>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-40 bg-muted" />
          <div className="h-3 w-64 bg-muted" />
        </div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto w-full space-y-4">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← back
        </Link>
        <p className="text-sm text-muted-foreground">api not found</p>
      </div>
    );
  }

  return (
    <ApiDetailView
      api={api}
      variant="owner"
      backHref="/dashboard"
      onDelete={handleDelete}
      deleting={deleting}
    />
  );
}
