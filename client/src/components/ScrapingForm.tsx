import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ky from "ky";
import { useState } from "react";

interface ScrapedContentResponse {
  title: string;
  content: string;
  characterCount: number;
  hash: string;
}

const formSchema = z.object({
  url: z.string().url().min(1, { message: "Required" }),
});

export default function ScrapingForm() {
  const [response, setResponse] = useState<ScrapedContentResponse | null>(null);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    toast.loading("Scraping website..." + values.url, {
      id: "scraping",
    });

    try {
      const json: ScrapedContentResponse = await ky
        .post("http://localhost:3000/scrape", {
          json: {
            url: values.url,
          },
          timeout: 100000,
        })
        .json();

      setResponse(json);

      toast.success("Scraping complete!", {
        id: "scraping",
      });
    } catch (e) {
      toast.error("Scraping failed!" + e, {
        id: "scraping",
      });
    }
  }

  return (
    <div>
      <h1>Scraping</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website to scrape</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormDescription>
                  This is the website that will be scraped and data will be
                  returned.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>

      {response && (
        <pre className="overflow-x-auto whitespace-pre-wrap max-w-7xl">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
