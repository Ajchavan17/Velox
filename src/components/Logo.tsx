import Link from 'next/link';

export default function Logo({ className = '', size = 32 }: { className?: string; size?: number }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center justify-center bg-[#1A1A1A] rounded-lg" style={{ width: size, height: size }}>
                <svg
                    width={size * 0.625}
                    height={size * 0.625}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M35 35 L50 75 L65 35"
                        stroke="var(--primary)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
                Velox
            </span>
        </div>
    );
}
