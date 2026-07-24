"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveMetricAction } from "@/app/actions/metrics";

const metricSchema = z.object({
  name: z.string().min(1, "Metric name is required"),
  value: z.string().min(1, "Value is required").refine(val => !isNaN(Number(val.replace(/,/g, ''))), "Must be a valid number"),
  platform: z.enum(["OnlyFans", "Redgifs", "Fansly", "Instagram"], {
    message: "Please select a valid platform"
  }),
});

type MetricFormValues = z.infer<typeof metricSchema>;

export function MetricForm() {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MetricFormValues>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      name: "",
      value: "",
      platform: "OnlyFans",
    }
  });

  const onValidSubmit = async (data: MetricFormValues) => {
    setFeedback(null);

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("value", data.value);
    formData.set("platform", data.platform);

    const result = await saveMetricAction(formData);

    if (result?.success) {
      setFeedback({ type: "success", text: "Metric recorded and database layout synchronized completely!" });
      reset(); // Wipe inputs cleanly on successful entry
    } else {
      setFeedback({ type: "error", text: result?.error || "An unknown submission glitch emerged." });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
      <h2 className="text-sm font-semibold text-slate-50 mb-4">Data Logger Configuration</h2>
      
      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
            Metric Name
          </label>
          <input 
            {...register("name")}
            type="text" 
            placeholder="e.g., Monthly Video Views" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
              Metric Value
            </label>
            <input 
              {...register("value")}
              type="text" 
              placeholder="e.g., 145,000" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
            {errors.value && <p className="text-red-400 text-xs mt-1">{errors.value.message}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
              Platform
            </label>
            <select 
              {...register("platform")}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="OnlyFans">OnlyFans</option>
              <option value="Redgifs">Redgifs</option>
              <option value="Fansly">Fansly</option>
              <option value="Instagram">Instagram</option>
            </select>
            {errors.platform && <p className="text-red-400 text-xs mt-1">{errors.platform.message}</p>}
          </div>
        </div>

        {/* Dynamic feedback banners */}
        {feedback && (
          <div className={`p-3 text-xs font-medium rounded-lg border ${
            feedback.type === "success" 
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800" 
              : "bg-rose-950/40 text-rose-400 border-rose-800"
          }`}>
            {feedback.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-400 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition duration-200"
        >
          {isSubmitting ? "Logging Event Details..." : "Save Metric Configuration"}
        </button>
      </form>
    </div>
  );
}