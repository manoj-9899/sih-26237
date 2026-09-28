import React from 'react';

/**
 * Reusable Defense-Grade UI Primitives for PQC Enclave Workstation
 */

// 1. SURFACES & CARDS
interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'elevated' | 'recessed';
  children: React.ReactNode;
  className?: string;
}

export const WorkstationSurface: React.FC<SurfaceProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[#12141a] border border-white/[0.08] shadow-sm',
    elevated: 'bg-[#181b22] border border-white/[0.12] shadow-md',
    recessed: 'bg-[#0d0e12] border border-white/[0.06] shadow-inner',
  };

  return (
    <div
      className={`rounded-lg p-5 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// 2. TACTICAL BUTTON SYSTEM
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'operational' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const OperationalButton: React.FC<ButtonProps> = ({
  variant = 'operational',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b0d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md font-mono',
    md: 'text-xs px-4 py-2.5 gap-2 rounded-md font-medium',
    lg: 'text-sm px-5 py-3 gap-2.5 rounded-lg font-semibold tracking-wide',
  };

  const variants = {
    // Single Primary Operational Accent (Tactical Slate Steel / restrained phosphor)
    operational:
      'bg-[#1f242d] hover:bg-[#282f3a] text-[#e6edf3] border border-white/[0.18] shadow-sm hover:border-white/[0.30] focus-visible:ring-white/40',
    // Secondary Workstation Trigger
    secondary:
      'bg-[#14161b] hover:bg-[#1a1d24] text-[#adbac7] hover:text-[#e6edf3] border border-white/[0.08] hover:border-white/[0.16] focus-visible:ring-white/20',
    // Clinical Danger Trigger (strictly reserved for breach/tamper/destructive simulation)
    danger:
      'bg-[#2d1215] hover:bg-[#3d181c] text-[#fca5a5] border border-red-500/30 hover:border-red-500/50 focus-visible:ring-red-500/40',
    // Ghost Link
    ghost:
      'bg-transparent hover:bg-white/[0.05] text-[#adbac7] hover:text-[#e6edf3] border border-transparent',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

// 3. SEMANTIC STATUS BADGES
interface StatusBadgeProps {
  status?: 'nominal' | 'active' | 'inspection' | 'breach' | 'neutral';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'neutral',
  children,
  icon,
  className = '',
}) => {
  const styles = {
    nominal: 'bg-[#161b22] text-[#adbac7] border border-white/[0.12]',
    active: 'bg-[#18212e] text-[#7ee787] border border-[#238636]/40',
    inspection: 'bg-[#261c10] text-[#f0883e] border border-[#f0883e]/30',
    breach: 'bg-[#2b1012] text-[#f85149] border border-[#da3633]/40',
    neutral: 'bg-[#161b22] text-[#768390] border border-white/[0.08]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-tight uppercase ${styles[status]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

// 4. CRYPTOGRAPHIC DATA CONTAINER (Archival Platinum Ink)
interface CryptoBlockProps {
  label: string;
  value: string;
  badge?: string;
  onCopy?: () => void;
  className?: string;
}

export const CryptoDataBlock: React.FC<CryptoBlockProps> = ({
  label,
  value,
  badge,
  className = '',
}) => {
  return (
    <div
      className={`p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] font-mono text-xs ${className}`}
    >
      <div className="flex items-center justify-between text-[11px] text-[#768390] uppercase mb-1.5 pb-1 border-b border-white/[0.04]">
        <span className="font-semibold tracking-wider">{label}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-[#adbac7] border border-white/[0.08]">
            {badge}
          </span>
        )}
      </div>
      <div className="break-all text-[#c5cbd3] leading-relaxed text-[11px]">
        {value}
      </div>
    </div>
  );
};

// 5. TECHNICAL METRIC TILE
interface MetricTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  status?: 'nominal' | 'inspection' | 'breach';
  className?: string;
}

export const TechnicalMetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subtext,
  status = 'nominal',
  className = '',
}) => {
  const valueColor = {
    nominal: 'text-[#e6edf3]',
    inspection: 'text-[#f0883e]',
    breach: 'text-[#f85149]',
  }[status];

  return (
    <div
      className={`p-3 rounded-md bg-[#12141a] border border-white/[0.08] ${className}`}
    >
      <span className="block text-[11px] font-mono uppercase text-[#768390] tracking-wider mb-1">
        {label}
      </span>
      <span className={`block text-lg font-bold font-mono tracking-tight ${valueColor}`}>
        {value}
      </span>
      {subtext && (
        <span className="block text-[10px] font-mono text-[#57606a] mt-0.5 truncate">
          {subtext}
        </span>
      )}
    </div>
  );
};
