"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Explicitly sign out of the client just in case
      await fetch("/api/auth/logout", { method: "POST" });
      
      // Redirect to login with a query param
      window.location.href = "/login?deleted=true";
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      alert(error.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 antialiased">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined}
            className="absolute inset-0 bg-[#04060A]/80 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="w-full max-w-md bg-[#0F1424]/95 border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl relative z-10"
          >
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] pointer-events-none" />

            <div className="p-6 relative">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Delete Account</h3>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                  Are you sure you want to delete your account? 
                </p>
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-400 font-medium">
                  This action is permanent and will immediately cancel any active subscription. All campaigns, metrics, and segmented data will be irrecoverably purged.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
