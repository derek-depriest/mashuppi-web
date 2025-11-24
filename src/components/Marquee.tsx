import { useEffect, useRef, useState } from 'react';

interface MarqueeProps {
    text: string;
    className?: string;
}

export function Marquee({ text, className = '' }: MarqueeProps) {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && textRef.current) {
                setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    if (!isOverflowing) {
        return (
            <div ref={containerRef} className={`truncate ${className}`}>
                <span ref={textRef}>{text}</span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
            <div className="inline-block animate-marquee">
                <span className="mr-8">{text}</span>
                <span className="mr-8">{text}</span>
            </div>
        </div>
    );
}
