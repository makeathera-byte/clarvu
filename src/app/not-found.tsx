export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-primary hover:underline">Go home</a>
            </div>
        </div>
    );
}

