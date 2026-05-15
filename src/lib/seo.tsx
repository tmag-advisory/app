import { Helmet } from "react-helmet-async";

const SITE_NAME = "Travel Medicine Advisory Global";
const SITE_URL = "https://travelmedicineadvisory.com";
const DEFAULT_DESCRIPTION =
    "Get personalized travel health recommendations based on your destination, medical history, and planned activities. Generate travel health plans in minutes.";
const DEFAULT_OG_IMAGE = "/hero-image.jpg";
const TWITTER_HANDLE = "@TMAGlobal";

export type JsonLd = Record<string, unknown> | Record<string, unknown>[];

interface SEOHeadProps {
    /** Page title (site name appended automatically). */
    title: string;
    /** Meta description (≤160 chars recommended). */
    description?: string;
    /** Canonical path (e.g. "/about"). Defaults to "/". */
    path?: string;
    /** og:image path or absolute URL. */
    ogImage?: string;
    /** Page-specific JSON-LD structured data. */
    jsonLd?: JsonLd;
    /** Override robots meta (default: "index, follow"). */
    robots?: string;
    /** og:type (default: "website"). */
    ogType?: string;
    /** Custom <link> elements to inject into <head>. */
    links?: React.ComponentPropsWithoutRef<"link">[];
    /** Custom inline <script> nodes (for deferred JSON-LD, etc.). */
    scripts?: { type?: string; innerHTML: string }[];
}

const SEOHead = ({
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    ogImage = DEFAULT_OG_IMAGE,
    jsonLd,
    robots = "index, follow",
    ogType = "website",
    links,
    scripts,
}: SEOHeadProps) => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;
    const imageUrl =
        ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

    return (
        <Helmet prioritizeSeoTags>
            {/* Primary meta */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            <meta name="robots" content={robots} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={TWITTER_HANDLE} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Additional links */}
            {links?.map((linkProps, i) => (
                <link key={i} {...linkProps} />
            ))}

            {/* Inline scripts (JSON-LD, etc.) */}
            {scripts?.map((s, i) => (
                <script key={i} type={s.type ?? "application/ld+json"}>
                    {s.innerHTML}
                </script>
            ))}

            {/* Single JSON-LD provided via prop */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEOHead;
