"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({ value, onChange, options, disabled, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative w-full ${className || ''}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="truncate">{selectedOption?.label || "Select..."}</span>
        <ChevronDown className="w-4 h-4 text-zinc-500" />
      </button>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-auto max-h-60 text-left">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                option.value === value 
                  ? "bg-gray-800 text-yellow-500 font-bold" 
                  : "text-zinc-300 hover:bg-gray-800 hover:text-yellow-500"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
