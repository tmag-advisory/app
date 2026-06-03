import { Link, useParams } from "react-router-dom";
import { LucideArrowLeft, LucideClock, LucideLoader2 } from "lucide-react";
import AnimateIn from "../../components/animations/AnimateIn";
import SEOHead from "../../lib/seo";
import SectionEyebrow from "../../components/ui/SectionEyebrow";
import BlogContent from "../../components/blog/BlogContent";
import { useBlogPostBySlug } from "../../api/hooks";

function formatDate(value: string | null | undefined) {
    if (!value) return "Recently";
    return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function BlogDetail() {
    const { slug } = useParams();
    const { data: post, isLoading, isError } = useBlogPostBySlug(slug);

    if (isLoading) {
        return (
            <main className="px-8 lg:px-16 py-24 min-h-[60vh] flex items-center justify-center text-muted">
                <LucideLoader2 className="w-6 h-6 animate-spin" />
            </main>
        );
    }

    if (isError || !post) {
        return (
            <main className="px-8 lg:px-16 py-24 min-h-[60vh]">
                <SEOHead title="Blog post not found — TMAG" description="This TMAG blog post could not be found." path={slug ? `/blog/${slug}` : "/blog"} />
                <div className="max-w-2xl mx-auto text-center bg-button-secondary rounded-3xl p-10">
                    <SectionEyebrow className="mb-5">Blog</SectionEyebrow>
                    <h1 className="text-4xl md:text-5xl font-serif text-heading leading-tight mb-4">Article not found.</h1>
                    <p className="text-sm text-body mb-8">The post may have been unpublished or moved.</p>
                    <Link to="/blog" className="inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-3 text-sm font-semibold text-background-primary hover:bg-darkest transition-colors">
                        <LucideArrowLeft className="w-4 h-4" />
                        Back to blog
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main>
            <SEOHead title={`${post.title} — TMAG Blog`} description={post.excerpt} path={`/blog/${post.slug}`} />

            {/* ─── Full-bleed hero (when image present) ─── */}
            {post.featuredImageUrl && (
                <section className="relative min-h-[55vh] lg:min-h-[65vh] flex items-end overflow-hidden">
                    <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-dark/85 via-dark/40 to-transparent" />
                    <div className="relative z-10 w-full px-8 lg:px-16 pb-10 lg:pb-14 max-w-5xl mx-auto">
                        <AnimateIn>
                            <Link
                                to="/blog"
                                className="inline-flex items-center gap-2 text-sm text-background-primary/70 hover:text-background-primary transition-colors mb-6"
                            >
                                <LucideArrowLeft className="w-4 h-4" />
                                Back to blog
                            </Link>
                            {post.category && (
                                <span className="inline-block text-xs font-semibold text-background-primary bg-accent/20 rounded-lg px-3 py-1 mb-4">
                                    {post.category.name}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl leading-[0.95] font-serif text-background-primary mb-4 max-w-4xl">
                                {post.title}
                            </h1>
                            <p className="text-base md:text-lg text-background-primary/80 leading-relaxed max-w-2xl mb-6">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-background-primary/60">
                                <LucideClock className="w-4 h-4" />
                                <span>
                                    {formatDate(post.publishedAt ?? post.createdAt)} · {post.readTime} min read
                                    {post.authorName ? ` · ${post.authorName}` : ""}
                                </span>
                            </div>
                        </AnimateIn>
                    </div>
                </section>
            )}

            {/* ─── Article body ─── */}
            <article className={`px-8 lg:px-16 ${post.featuredImageUrl ? "py-12 lg:py-16" : "py-20"} max-w-3xl mx-auto`}>
                {/* ─── Clean header (when no image) ─── */}
                {!post.featuredImageUrl && (
                    <AnimateIn>
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-10"
                        >
                            <LucideArrowLeft className="w-4 h-4" />
                            Back to blog
                        </Link>
                        {post.category && <SectionEyebrow className="mb-6">{post.category.name}</SectionEyebrow>}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] font-serif text-heading mb-6">
                            {post.title}
                        </h1>
                        <p className="text-lg text-body leading-relaxed mb-6">
                            {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted border-y border-border-light py-4 mb-10">
                            <LucideClock className="w-3.5 h-3.5" />
                            <span>
                                {formatDate(post.publishedAt ?? post.createdAt)} · {post.readTime} min read
                                {post.authorName ? ` · ${post.authorName}` : ""}
                            </span>
                        </div>
                    </AnimateIn>
                )}

                {/* ─── Content ─── */}
                <AnimateIn type="fade" delay={0.08}>
                    <BlogContent html={post.content} />
                </AnimateIn>

                {/* ─── Tags ─── */}
                {post.tags.length > 0 && (
                    <AnimateIn type="fade" delay={0.12} className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border-light">
                        {post.tags.map((tag) => (
                            <span key={tag.id} className="text-xs text-muted bg-button-secondary rounded-lg px-3 py-1.5">
                                #{tag.name}
                            </span>
                        ))}
                    </AnimateIn>
                )}
            </article>
        </main>
    );
}
