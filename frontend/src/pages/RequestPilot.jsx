import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";

const SECTORS = [
  "School / education",
  "Community law",
  "Citizens Advice Bureau",
  "Insurance / financial services",
  "Health / GP practice",
  "Council / local government",
  "Other",
];

const REGIONS = [
  "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne",
  "Hawke's Bay", "Taranaki", "Manawatu-Whanganui", "Wellington",
  "Nelson / Tasman", "Marlborough", "West Coast", "Canterbury",
  "Otago", "Southland", "Nationwide",
];

const PILOT_INCLUDES = [
  "Scoped document set configured to your sector",
  "Domain rules and vocabulary for your document types",
  "Workflow integration guidance",
  "Product support throughout the pilot",
  "Review meeting at the end",
  "Written report with findings and recommendations",
];

export default function RequestPilot() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-safe-light">
              <Check className="h-7 w-7 text-safe" />
            </div>
            <h1 className="text-2xl font-bold text-ink">Thank you</h1>
            <p className="mt-4 text-ink-mid">
              Your enquiry has been received. A real person will read it and
              reply within two working days.
            </p>
            <Button variant="secondary" className="mt-8" asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">
              Request a pilot
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              A short, scoped engagement to see Plainly working with your
              documents and your audience. A real person replies.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 lg:grid-cols-5">
              {/* Left — description */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-ink">
                  What a pilot looks like
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">Duration</h3>
                      <Badge variant="secondary">6–8 weeks</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">Scope</h3>
                      <Badge variant="secondary">5–20 documents</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-mid">One sector layer</p>
                  </div>
                </div>

                <h3 className="mt-8 text-sm font-semibold text-ink">
                  What's included
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {PILOT_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                      <span className="text-sm text-ink-mid">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — form */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Enquiry form</CardTitle>
                    <CardDescription>
                      All fields help us prepare, but only your name and email
                      are required.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="space-y-5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSubmitted(true);
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="org">Organisation name</Label>
                        <Input
                          id="org"
                          name="org"
                          placeholder="e.g. Northland Community Law Centre"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Your name <span className="text-accent">*</span>
                        </Label>
                        <Input id="name" name="name" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Your role</Label>
                        <Input
                          id="role"
                          name="role"
                          placeholder="e.g. Manager, Team leader, Principal"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Work email <span className="text-accent">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@organisation.co.nz"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sector">Sector</Label>
                        <Select id="sector" name="sector" defaultValue="">
                          <option value="" disabled>Select your sector</option>
                          {SECTORS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select id="region" name="region" defaultValue="">
                          <option value="" disabled>Select your region</option>
                          {REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="users">Approximate number of end users</Label>
                        <Input
                          id="users"
                          name="users"
                          placeholder="e.g. 50, 200, 1000+"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="docs">Documents you'd want to include</Label>
                        <Textarea
                          id="docs"
                          name="docs"
                          rows={3}
                          placeholder="e.g. Tenancy agreements, benefit review letters, school enrolment forms"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Anything else?</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          placeholder="Questions, context, or anything that helps us understand your situation"
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Send enquiry
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      <p className="text-center text-xs text-ink-faint">
                        A real person reads every enquiry and replies within two
                        working days.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
