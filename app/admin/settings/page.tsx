"use client";

import { useState, useEffect } from "react";
import { defaultSettings } from "@/lib/data";
import { useApi } from "@/hooks/use-api";
import { settingsService } from "@/lib/api/settings";
import type { StoreSettings } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function loadSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem("eid-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default function AdminSettings() {
  const { data: apiSettings, mutate } = useApi<StoreSettings>("/settings");
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (apiSettings) {
      setSettings(apiSettings);
    } else {
      setSettings(loadSettings());
    }
  }, [apiSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsService.update(settings);
      localStorage.setItem("eid-settings", JSON.stringify(settings));
      mutate();
      toast.success("Settings saved successfully");
    } catch {
      localStorage.setItem("eid-settings", JSON.stringify(settings));
      toast.success("Settings saved locally");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await settingsService.update(defaultSettings);
      setSettings(defaultSettings);
      localStorage.removeItem("eid-settings");
      mutate();
      toast.info("Settings reset to defaults");
    } catch {
      setSettings(defaultSettings);
      localStorage.removeItem("eid-settings");
      toast.info("Settings reset locally");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your store configuration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, storeName: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="storePhone">Phone Number</Label>
              <Input
                id="storePhone"
                value={settings.storePhone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, storePhone: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="storeEmail">Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={settings.storeEmail}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, storeEmail: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Delivery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="deliveryCharge">Delivery Charge (Rs.)</Label>
              <Input
                id="deliveryCharge"
                type="number"
                value={settings.deliveryCharge}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    deliveryCharge: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Standard delivery charge applied to all orders below the free
                delivery threshold.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="freeDeliveryThreshold">
                Free Delivery Threshold (Rs.)
              </Label>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    freeDeliveryThreshold: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Orders above this amount qualify for free delivery.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              Admin Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <p className="font-medium text-foreground">Default Admin Login</p>
              <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Email:</span>{" "}
                  admin@eidcollection.pk
                </p>
                <p>
                  <span className="font-medium text-foreground">Password:</span>{" "}
                  admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
