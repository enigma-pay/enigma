"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiForm } from "@/components/dashboard/api-form";
import { useAuth } from "@/components/providers/auth-provider";
import { getApi, updateApi } from "@/lib/api";
import { Api, CreateApiRequest } from "@/lib/types";

export default function EditApiPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const apiName = params.apiName as string;

  const [api, setApi] = useState<Api | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchApi = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getApi(user.user_name, apiName);
      setApi(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load API");
    } finally {
      setLoading(false);
    }
  }, [user, apiName]);

  useEffect(() => {
    fetchApi();
  }, [fetchApi]);

  async function handleSubmit(data: CreateApiRequest) {
    if (!user) return;
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateApi(user.user_name, apiName, data);
      router.push(`/dashboard/${updated.name}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update API");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto w-full space-y-4">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-40 bg-muted" />
          <div className="h-3 w-64 bg-muted" />
        </div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto w-full">
        <p className="text-sm text-muted-foreground">api not found</p>
      </div>
    );
  }

  return (
    <ApiForm
      mode="edit"
      initialApi={api}
      submitting={submitting}
      submitError={error}
      onSubmit={handleSubmit}
    />
  );
}
