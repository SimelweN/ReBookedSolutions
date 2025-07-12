import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "product";
  product?: ProductSEO;
  article?: ArticleSEO;
  breadcrumbs?: BreadcrumbItem[];
  noIndex?: boolean;
}

interface ProductSEO {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  condition: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  brand?: string;
  isbn?: string;
  author?: string;
  category?: string;
  seller?: {
    name: string;
    url?: string;
  };
  reviews?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface ArticleSEO {
  headline: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  publisher: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "ReBooked Solutions - Buy and Sell Textbooks Securely",
  description = "Your secure platform for buying and selling used textbooks. Find affordable textbooks or sell your books to students across South Africa.",
  keywords = "textbooks, university books, college books, buy textbooks, sell textbooks, South Africa, students, affordable books",
  canonical,
  image = "/placeholder.svg",
  imageAlt = "ReBooked Solutions Logo",
  type = "website",
  product,
  article,
  breadcrumbs,
  noIndex = false,
}) => {
  const siteUrl = "https://rebookedsolutions.co.za";
  const fullImageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const canonicalUrl = canonical || siteUrl;

  // Generate structured data
  const generateStructuredData = () => {
    const structuredData: any[] = [];

    // Organization schema
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ReBooked Solutions",
      url: siteUrl,
      logo: `${siteUrl}/placeholder.svg`,
      description:
        "Secure platform for buying and selling used textbooks in South Africa",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+27-123-456-789",
        contactType: "customer service",
        availableLanguage: ["English", "Afrikaans"],
      },
      sameAs: [
        "https://facebook.com/rebookedsolutions",
        "https://twitter.com/rebookedsolutions",
      ],
    });

    // Website schema
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ReBooked Solutions",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/books?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    // Product schema for book listings
    if (product) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.image.startsWith("http")
          ? product.image
          : `${siteUrl}${product.image}`,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency,
          availability: `https://schema.org/${product.availability}`,
          itemCondition: `https://schema.org/${product.condition}`,
          seller: {
            "@type": "Person",
            name: product.seller?.name || "ReBooked Seller",
          },
        },
        brand: product.brand,
        category: product.category,
        ...(product.isbn && {
          isbn: product.isbn,
          "@type": "Book",
          author: {
            "@type": "Person",
            name: product.author,
          },
        }),
        ...(product.reviews && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.reviews.ratingValue,
            reviewCount: product.reviews.reviewCount,
          },
        }),
      });
    }

    // Article schema for blog posts
    if (article) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.headline,
        author: {
          "@type": "Person",
          name: article.author,
        },
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        image: article.image.startsWith("http")
          ? article.image
          : `${siteUrl}${article.image}`,
        publisher: {
          "@type": "Organization",
          name: article.publisher,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/placeholder.svg`,
          },
        },
      });
    }

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http")
            ? item.url
            : `${siteUrl}${item.url}`,
        })),
      });
    }

    return structuredData;
  };

  const structuredData = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={canonicalUrl} />}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ReBooked Solutions" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content="@rebookedsolutions" />

      {/* Additional Meta Tags */}
      <meta name="author" content="ReBooked Solutions" />
      <meta name="theme-color" content="#65c69f" />

      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
};

export default SEO;
