export default function DashboardLoading() {
    return (
        <div className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="mb-8">
                        <div className="h-10 bg-muted rounded-lg w-64 mb-2"></div>
                        <div className="h-6 bg-muted rounded w-48"></div>
                    </div>

                    {/* Main grid - Timer and Tasks */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* Timer skeleton */}
                        <div className="h-[500px] bg-muted rounded-2xl"></div>

                        {/* Tasks skeleton */}
                        <div className="h-[500px] bg-muted rounded-2xl"></div>
                    </div>

                    {/* Bottom cards - Overview, Chart, Timeline */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="h-72 bg-muted rounded-2xl"></div>
                        <div className="h-72 bg-muted rounded-2xl"></div>
                        <div className="h-72 bg-muted rounded-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
