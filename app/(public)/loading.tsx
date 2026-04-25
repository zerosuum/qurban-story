export default function PublicLoading() {
    return (
        <main>
            <section className="min-h-[calc(100vh-80px)] px-4 sm:px-8 lg:px-10 py-12 sm:py-16 lg:py-20 bg-neutral-200/70 skeleton-shimmer" />

            <section className="bg-secondary px-4 sm:px-8 lg:px-10 py-14 sm:py-20">
                <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
                    <div className="h-8 sm:h-10 w-1/2 mx-auto rounded bg-white/70 skeleton-shimmer" />
                    <div className="h-5 sm:h-6 w-full rounded bg-white/70 skeleton-shimmer" />
                    <div className="h-5 sm:h-6 w-5/6 mx-auto rounded bg-white/70 skeleton-shimmer" />
                </div>
            </section>

            <section className="bg-primary px-4 sm:px-8 lg:px-10 py-14 sm:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="h-8 sm:h-10 w-2/3 sm:w-1/3 mx-auto rounded bg-white/20 skeleton-shimmer" />
                    <div className="mt-4 h-5 w-full sm:w-1/2 mx-auto rounded bg-white/20 skeleton-shimmer" />
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="min-h-64 rounded-lg bg-white/90 p-5 sm:p-6 skeleton-shimmer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-neutral-100 skeleton-shimmer" />
                                <div className="mt-4 h-5 w-4/5 rounded bg-neutral-100 skeleton-shimmer" />
                                <div className="mt-3 h-4 w-full rounded bg-neutral-100 skeleton-shimmer" />
                                <div className="mt-2 h-4 w-5/6 rounded bg-neutral-100 skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-secondary px-4 sm:px-8 lg:px-10 py-14 sm:py-20">
                <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="min-h-52 rounded-lg bg-white p-5 sm:p-6 skeleton-shimmer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-neutral-100 skeleton-shimmer" />
                            <div className="mt-4 h-5 w-3/4 rounded bg-neutral-100 skeleton-shimmer" />
                            <div className="mt-3 h-4 w-full rounded bg-neutral-100 skeleton-shimmer" />
                            <div className="mt-2 h-4 w-4/5 rounded bg-neutral-100 skeleton-shimmer" />
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-primary px-4 sm:px-6 lg:px-10 py-14 sm:py-16">
                <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="w-full max-w-70 rounded-lg bg-white p-6 shadow-md skeleton-shimmer"
                        >
                            <div className="mx-auto aspect-square w-full max-w-58 rounded-lg bg-neutral-100 skeleton-shimmer" />
                            <div className="mt-4 space-y-3">
                                <div className="h-5 w-4/5 mx-auto rounded bg-neutral-100 skeleton-shimmer" />
                                <div className="h-5 w-3/5 mx-auto rounded bg-neutral-100 skeleton-shimmer" />
                                <div className="h-4 w-2/3 mx-auto rounded bg-neutral-100 skeleton-shimmer" />
                                <div className="h-10 w-full rounded-xl bg-neutral-100 skeleton-shimmer" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-secondary px-4 sm:px-8 lg:px-30 py-14 sm:py-20">
                <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
                    <div className="h-8 sm:h-10 w-3/4 mx-auto rounded bg-white/70 skeleton-shimmer" />
                    <div className="h-5 sm:h-6 w-full mx-auto rounded bg-white/70 skeleton-shimmer" />
                    <div className="h-10 w-44 mx-auto rounded-xl bg-primary/40 skeleton-shimmer" />
                </div>
            </section>
        </main>
    );
}
