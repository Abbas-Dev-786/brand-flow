import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

export async function crawlWebsite(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BrandFlow/1.0' }
    })

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove scripts, styles, nav
    $('script, style, nav, footer').remove()

    // Extract main content
    const texts: string[] = []

    // Title + meta
    const title = $('title').text()
    if (title) texts.push(title)

    $('meta[name="description"]').each((i, el) => {
      const content = $(el).attr('content')
      if (content) texts.push(content)
    })

    // Main content
    $('h1, h2, h3, p, li').each((i, el) => {
      const text = $(el).text().trim()
      if (text.length > 20) texts.push(text)
    })

    return texts.slice(0, 10) // Limit for MVP
  } catch (error: any) {
    throw new Error(`Failed to crawl ${url}: ${error.message}`)
  }
}
