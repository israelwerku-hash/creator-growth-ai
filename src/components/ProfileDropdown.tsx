"use client";

import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { UserCircle, Settings, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function ProfileDropdown({
  email,
  tier,
}: {
  email: string;
  tier: string;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-creator-cyan"
          aria-label="Profile Menu"
        >
          <UserCircle className="w-5 h-5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-300 truncate max-w-[150px]">
            {email}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-[#0A0A0A] border border-neutral-800/80 rounded-xl p-2 shadow-2xl animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 z-[60] text-white"
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2 border-b border-neutral-800/80 mb-2">
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-1">
              Signed in as
            </p>
            <p className="text-sm font-bold truncate text-white">{email}</p>
            <p className="text-xs text-white font-bold mt-1">
              {tier} Tier
            </p>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-900/50 rounded-lg cursor-pointer outline-none transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-neutral-800/80 my-2" />

          <DropdownMenu.Item className="flex items-center justify-between px-3 py-1 text-sm text-neutral-300 cursor-default outline-none hover:bg-neutral-900/50 rounded-lg">
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </span>
            <SignOutButton />
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-neutral-800/80 my-2" />

          <DropdownMenu.Item asChild>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-burgundy-primary hover:text-white hover:bg-burgundy-primary rounded-lg cursor-pointer outline-none transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
      />
    </DropdownMenu.Root>
  );
}
