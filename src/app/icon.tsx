import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00ff94',
                }}
            >
                {/* Simplified V shape for small icon */}
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        rx="20"
                        fill="#1A1A1A"
                    />
                    <path
                        d="M35 35 L50 75 L65 35"
                        stroke="#00ff94"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
