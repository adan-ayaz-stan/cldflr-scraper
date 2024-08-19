import puppeteer, { Browser } from "puppeteer";

import { CloudflareBypasser } from "./CloudflareBypass";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { validator } from "hono/validator";
import { z } from "zod";

// Assum

const argumentsaa = [
  // "--remote-debugging-port=9222",  // Add this line for remote debugging
  "-no-first-run",
  "-force-color-profile=srgb",
  "-metrics-recording-only",
  "-password-store=basic",
  "-use-mock-keychain",
  "-export-tagged-pdf",
  "-no-default-browser-check",
  "-disable-background-mode",
  "-enable-features=NetworkService,NetworkServiceInProcess,LoadCryptoTokenExtension,PermuteTLSExtensions",
  "-disable-features=FlashDeprecationWarning,EnablePasswordsAccountStorage",
  "-deny-permission-prompts",
  "-disable-gpu",
  "-accept-lang=en-US",
  // "-incognito"// You can add this line to open the browser in incognito mode by default
];

const app = new Hono();

app.use(cors());
app.use(logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

interface ScrapedContentResponse {
  title: string;
  content: string;
  characterCount: number;
  isCloudflareProtected?: boolean;
}

const schema = z.object({
  url: z
    .string()
    .url({ message: "Invalid URL" })
    .transform((url) => new URL(url)),
});

const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36";

let cookies = [
  {
    name: "__cfduid",
    value: "",
    domain: "",
    path: "/",
    expires: 1578864412.897863,
    size: 51,
    httpOnly: true,
    secure: true,
    session: false,
  },
  {
    name: "",
    value: "",
    domain: "",
    path: "/",
    expires: 1576362412.897796,
    size: 69,
    httpOnly: true,
    secure: false,
    session: false,
  },
];

app.post(
  "/scrape",
  validator("json", (value, c) => {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.text("Invalid!", 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const validated = c.req.valid("json");

    const url = validated.url;

    const browser = await puppeteer.launch({
      headless: true,
      args: argumentsaa,
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.goto(url.toString(), {
      waitUntil: "networkidle2",
    });

    const title = await page.title();
    const content = await page.content();
    const characterCount = content.length;

    const response: ScrapedContentResponse = {
      title,
      content,
      characterCount,
    };

    return c.json(response);
  }
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
