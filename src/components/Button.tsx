export default function PrimaryButton({ children, onClick, className, ...props }: { children: React.ReactNode, onClick: () => void, className?: string, props?: any }) {
    return (
        <button onClick={onClick} className={`bg-green-500 text-white text-lg px-8 py-2 sm:py-3 rounded-md cursor-pointer ${className}`} {...props}>
            {children}
        </button>
    );
}


