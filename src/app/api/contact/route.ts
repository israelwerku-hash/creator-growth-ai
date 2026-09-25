import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
}).strict();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid form data" },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn("[CONTACT_FORM] Missing RESEND_API_KEY. Simulating success.");
      return NextResponse.json({ success: true, message: "Message sent successfully" }, { status: 200 });
    }

    const resend = new Resend(resendApiKey);

    const { error } = await resend.emails.send({
      from: "Ataraxia <onboarding@resend.dev>",
      to: "israelwerku@gmail.com",
      subject: `New Agency/Enterprise Contact Lead from ${name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px;">
          <h2 style="color: #800020;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 1px solid #eee; margin: 16px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error("[CONTACT] Resend API error:", error);
      return NextResponse.json({ error: "Failed to send your message via email." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("[CONTACT] Unhandled error:", err.message);
    return NextResponse.json({ error: "Failed to process your message" }, { status: 500 });
  }
}
