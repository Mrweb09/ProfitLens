"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Trash2, Plus, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restricted, setRestricted] = useState(false);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/api-keys");
    if (res.status === 403) { setRestricted(true); setLoading(false); return; }
    const data = await res.json();
    setKeys(data.keys ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setCreating(false); return; }
    setKeys((prev) => [data.apiKey, ...prev]);
    setNewName("");
    setShowForm(false);
    setCreating(false);
  };

  const deleteKey = async (id: string) => {
    await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (restricted) {
    return (
      <div className="p-8 max-w-2xl mx-auto pt-20 text-center">
        <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">API Access</h1>
        <p className="text-gray-400 mb-6">API access is available on Growth and Agency plans.</p>
        <Link href="/dashboard/billing">
          <Button variant="gradient">Upgrade Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-gray-400 text-sm mt-1">Use the AuditRoast API to run audits programmatically.</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Key
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-violet-500/30">
          <CardContent className="p-5">
            <h3 className="text-white font-semibold mb-3">Create API Key</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Key name (e.g. Production)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createKey()}
              />
              <Button variant="gradient" onClick={createKey} disabled={creating || !newName.trim()}>
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-gray-500 text-center py-12">Loading...</div>
        ) : keys.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Key className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No API keys yet. Create one to start using the API.</p>
              <Button variant="gradient" size="sm" onClick={() => setShowForm(true)}>Create First Key</Button>
            </CardContent>
          </Card>
        ) : (
          keys.map((k) => (
            <Card key={k.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Key className="w-5 h-5 text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{k.name}</span>
                    <Badge variant="outline" className="text-xs">{k.key.substring(0, 16)}...</Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsed && ` · Last used ${new Date(k.lastUsed).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => copy(k.key, k.id)}>
                    {copiedId === k.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => deleteKey(k.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-8 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-300">API Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-2">Run an audit via API:</p>
            <pre className="bg-black/40 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">{`POST ${process.env.NEXT_PUBLIC_APP_URL ?? "https://AuditRoast.com"}/api/v1/audit
Authorization: Bearer pl_live_...
Content-Type: application/json

{ "url": "https://example.com" }`}</pre>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Response:</p>
            <pre className="bg-black/40 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">{`{
  "auditId": "...",
  "overallScore": 74,
  "trustScore": 68,
  "uxScore": 81,
  "seoScore": 72,
  "mobileScore": 65,
  "revenueOpportunity": 3200,
  "dashboardUrl": "https://AuditRoast.com/dashboard/audit/..."
}`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

