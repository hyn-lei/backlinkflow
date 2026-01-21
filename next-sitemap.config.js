/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://backlinkflow.app',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: ['/api/*', '/sign-in', '/sign-up', '/board'],
    changefreq: 'daily',
    priority: 0.7,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/board', '/sign-in', '/sign-up'],
            },
        ],
    },
};
