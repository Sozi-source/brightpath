import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/projects", "/projects/", "/api/projects/*/cover"],
        disallow: [
          "/admin",
          "/studio",
          "/library",
          "/supervisor",
          "/api/",
          "/login",
          "/signup",
          "/reset-password",
          "/learn",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
