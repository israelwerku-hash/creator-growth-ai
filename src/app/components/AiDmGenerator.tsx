"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MessageSquare, Sparkles, Copy, Check, Wand2, DollarSign, Send } from "lucide-react";

const dmSchema = z.object({
  campaignType: z.string().min(1, "Campaign type is required"),
  targetSegment: z.string().min(1, "Target segment is required"),
  customContext: z.string().max(200, "Context must be 200 characters or less").optional(),
});

type DmFormValues = z.infer<typeof dmSchema>;

export function AiDmGenerator() {
  const [generatedScript, setGeneratedScript] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DmFormValues>({
    resolver: zodResolver(dmSchema),
    defaultValues: {
      campaignType: "PPV_LOCK",
      targetSegment: "Whales",
      customContext: "",
    },
  });

  const handleGenerateScript = async (data: DmFormValues) => {
    // Simulating deep contextual text compilation with async delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const scriptMatrix: Record<string, string> = {
      PPV_LOCK: `Hey premium eyes only... 🤫 I was thinking about what you said last week, so I made a completely private clip just for you. No one else on my feed gets this version tonight. Let me know if you love it as much as I do... Locked PPV [$29.00]`,
      RE_ENGAGE: `Hey stranger! Stranger danger... 😘 Realized it’s been a second since we chatted in the DMs. I missed seeing your name pop up. Drop a reply to this and I'll send you a little unreleased surprise directly to your inbox tonight.`,
      UPSELL: `You've been treating me so incredibly well lately that I wanted to give you something extra special. Here is a custom setup shoot from this morning. Unlock it below and tell me your favorite frame... Locked PPV [$45.00]`
    };

    const contextualAddon = data.customContext ? `\n\n[AI Context Added]: Mentioning "${data.customContext}"` : "";
    setGeneratedScript(scriptMatrix[data.campaignType] || scriptMatrix["PPV_LOCK"]);
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" /> AI DM Sales Script Generator
          </h2>
          <p className="text-xs text-slate-400">Instantly generate cash-flowing copy sequences optimized for retention.</p>
        </div>
        <span className="text-[10px] font-mono bg-purple-950/50 text-purple-400 border border-purple-900 px-2 py-0.5 rounded">
          Cost: 30 Credits
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Left Side Settings Form */}
        <form onSubmit={handleSubmit(handleGenerateScript)} className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              Campaign Conversion Angle
            </label>
            <select
              {...register("campaignType")}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
            >
              <option value="PPV_LOCK">Mass PPV Attachment ($$$)</option>
              <option value="RE_ENGAGE">Inactive Fan Re-Engagement Hook</option>
              <option value="UPSELL">VIP High-Tier Spender Upsell Flow</option>
            </select>
            {errors.campaignType && <p className="text-red-400 text-xs mt-1">{errors.campaignType.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              Target Fan Audience Segment
            </label>
            <select
              {...register("targetSegment")}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
            >
              <option value="Whales">Top Tier Whales (High Spenders)</option>
              <option value="Loyals">Consistent Chatters (Loyal Base)</option>
              <option value="Ghosts">Cold Ghost Fans (14+ Days Inactive)</option>
            </select>
            {errors.targetSegment && <p className="text-red-400 text-xs mt-1">{errors.targetSegment.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              Custom Trigger Words / Context (Optional)
            </label>
            <textarea
              {...register("customContext")}
              placeholder="e.g., mention the custom outfit from my story update or ask about his weekend..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition resize-none"
            />
            {errors.customContext && <p className="text-red-400 text-xs mt-1">{errors.customContext.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>Synthesizing... <Wand2 className="w-3.5 h-3.5 animate-spin" /></>
            ) : (
              <>Compile AI Script <Sparkles className="w-3.5 h-3.5 text-amber-400" /></>
            )}
          </button>
        </form>

        {/* Right Side Code Terminal Preview Output Block */}
        <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative min-h-[220px]">
          {generatedScript ? (
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  ● COMPILE SUCCESSFUL (Ready to deploy)
                </div>
                <p className="text-xs font-mono text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 select-all">
                  {generatedScript}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied to Clipboard!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Script Copy</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center my-auto space-y-2 p-4">
              <Wand2 className="w-8 h-8 text-slate-700 animate-pulse" />
              <div className="text-xs font-medium text-slate-400">Terminal Awaiting Calibration</div>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Select your conversion angle parameters and click generate to review high-converting sales scripts instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}