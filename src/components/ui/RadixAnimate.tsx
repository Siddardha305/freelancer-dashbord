'use client'

import React from 'react'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, Check } from "lucide-react"

// 1. Radix Dialog (Modal Wrapper)
interface RadixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  sizeClassName?: string;
}

export function RadixDialog({ isOpen, onClose, title, description, children, sizeClassName = "max-w-lg" }: RadixDialogProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="fixed inset-0 z-55 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
              >
                <div className={`bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full ${sizeClassName} overflow-hidden relative border border-slate-200 pointer-events-auto`}>
                  <div className="flex justify-between items-center p-8 border-b border-slate-100">
                    <div>
                      <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
                        {title}
                      </DialogPrimitive.Title>
                      {description && (
                        <DialogPrimitive.Description className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
                          {description}
                        </DialogPrimitive.Description>
                      )}
                    </div>
                    <DialogPrimitive.Close asChild>
                      <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
                        <X className="h-5 w-5" />
                      </button>
                    </DialogPrimitive.Close>
                  </div>
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

// 2. Radix Select (Dropdown Wrapper)
interface RadixSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  name?: string;
}

export function RadixSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className = "",
  name
}: RadixSelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} name={name}>
      <SelectPrimitive.Trigger
        className={`flex items-center justify-between gap-2 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all w-full cursor-pointer ${className}`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          asChild
          position="popper"
          sideOffset={5}
          className="z-[100] min-w-[200px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className="relative flex items-center px-8 py-2.5 text-xs font-bold text-slate-700 uppercase rounded-xl select-none outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-600 cursor-pointer transition-colors"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2.5 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-indigo-600" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

// 3. Radix Switch (Toggle Wrapper)
interface RadixSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  name?: string;
  className?: string;
}

export function RadixSwitch({
  checked,
  onCheckedChange,
  name,
  className = ""
}: RadixSwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      name={name}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-650/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-200 ${className}`}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
