"use client"

import * as React from "react"
import type { ToastProps, ToastActionElement } from "@radix-ui/react-toast"
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const Toast = React.forwardRef<
  React.ElementRef<typeof Toast>,
  ToastProps & {
    icon?: React.ReactNode
    action?: ToastActionElement
    variant?: "default" | "destructive" | "success" | "info" | "warning"
  }
>(({ className, variant, icon, action, ...props }, ref) => {
  const { toast } = useToast()

  const iconMap = {
    default: <Info className="h-4 w-4 text-blue-500" />,
    destructive: <XCircle className="h-4 w-4 text-red-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        variant === "default" && "border-gray-200 bg-white text-gray-900",
        variant === "destructive" && "border-red-500 bg-red-500 text-white",
        variant === "success" && "border-green-500 bg-green-500 text-white",
        variant === "info" && "border-blue-500 bg-blue-500 text-white",
        variant === "warning" && "border-yellow-500 bg-yellow-500 text-white",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon || (variant ? iconMap[variant] : iconMap.default)}
        <div className="grid gap-1">
          {props.title && <div className="text-sm font-semibold">{props.title}</div>}
          {props.description && <div className="text-sm opacity-90">{props.description}</div>}
        </div>
      </div>
      {action && (
        <Button
          variant="secondary"
          onClick={() => {
            action.onClick?.()
            toast({ id: props.id, dismiss: true })
          }}
          className="ml-auto"
        >
          {action.altText}
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() => toast({ id: props.id, dismiss: true })}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  )
})
Toast.displayName = "Toast"

export { Toast }

export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastTitle = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastDescription = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastClose = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick} className="sr-only">
    close
  </button>
)
export const ToastViewport = ({ children }: { children?: React.ReactNode }) => <>{children}</>
