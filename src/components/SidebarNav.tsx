"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, MessageSquare, PieChart, CreditCard, 
  UserCircle, Settings, HelpCircle, Languages, Users, BarChart3, Compass
} from "lucide-react";

export function SidebarNav({ isAgency }: { isAgency: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/guide", icon: Compass, label: "How to Use" },
    { href: "/dashboard/dm-generation", icon: MessageSquare, label: "DM Generation" },
    { href: "/dashboard/segmentation", icon: Users, label: "Segmentation" },
    { href: "/dashboard/memory-vault", icon: PieChart, label: "Memory Vault" },
    { href: "/dashboard/translator", icon: Languages, label: "Translator" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  ];

  if (!isAgency) {
    links.push({ href: "/dashboard/billing", icon: CreditCard, label: "Billing" });
  }

  const bottomLinks = [
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    { href: "/dashboard/help", icon: HelpCircle, label: "Help" },
  ];

  return (
    <>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-3">Menu</p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              prefetch={true}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out active:scale-[0.98] text-[13px] font-medium ${
                isActive 
                  ? "bg-burgundy-primary/10 text-white border-l-[3px] border-burgundy-primary" 
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/50 border-l-[3px] border-transparent"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? "text-burgundy-primary" : "text-neutral-400"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-neutral-800/60 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-3">Support</p>
        {bottomLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              prefetch={true}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out active:scale-[0.98] text-[13px] font-medium ${
                isActive 
                  ? "bg-burgundy-primary/10 text-white border-l-[3px] border-burgundy-primary" 
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/50 border-l-[3px] border-transparent"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? "text-burgundy-primary" : "text-neutral-400"}`} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
